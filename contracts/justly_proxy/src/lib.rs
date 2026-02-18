#![no_std]

use error::ContractError;
use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, IntoVal, Symbol};
use types::{
    Config, CreateDisputeParams, DisputeStatus, ProxyDispute, BOUND_TOPIC, CREATED_TOPIC,
    EVIDENCE_TOPIC, EXECUTED_TOPIC, PAID_TOPIC, RULING_TOPIC,
};

mod error;
mod storage;
mod types;

#[cfg(test)]
mod tests;

#[contract]
pub struct JustlyProxy;

#[contractimpl]
impl JustlyProxy {
    pub fn __constructor(env: Env, admin: Address, relayer: Address) {
        admin.require_auth();
        storage::set_config(&env, &Config { admin, relayer });
        storage::set_counter(&env, 0);
    }

    pub fn set_relayer(env: Env, relayer: Address) -> Result<(), ContractError> {
        require_admin(&env)?;
        let mut cfg = storage::get_config(&env)?;
        cfg.relayer = relayer.clone();
        storage::set_config(&env, &cfg);
        env.events()
            .publish((Symbol::new(&env, "relayer"),), relayer);
        Ok(())
    }

    pub fn create_dispute(env: Env, params: CreateDisputeParams) -> Result<u64, ContractError> {
        params.claimer.require_auth();

        if params.claimer == params.defender
            || params.jurors_required == 0
            || params.required_amount <= 0
        {
            return Err(ContractError::ErrInvalidInput);
        }

        let id = storage::next_dispute_id(&env);
        let dispute = ProxyDispute {
            id,
            arbitrable: params.arbitrable.clone(),
            claimer: params.claimer.clone(),
            defender: params.defender.clone(),
            category: params.category.clone(),
            root_evidence_hash: params.root_evidence_hash,
            jurors_required: params.jurors_required,
            pay_seconds: params.pay_seconds,
            evidence_seconds: params.evidence_seconds,
            commit_seconds: params.commit_seconds,
            reveal_seconds: params.reveal_seconds,
            required_amount: params.required_amount,
            claimer_paid: false,
            defender_paid: false,
            claimer_amount: 0,
            defender_amount: 0,
            remote_dispute_id: None,
            ruling: None,
            rule_executed: false,
            status: DisputeStatus::Created,
            created_at: env.ledger().timestamp(),
        };

        storage::set_dispute(&env, &dispute);
        env.events().publish(
            (CREATED_TOPIC, id),
            (
                params.arbitrable,
                params.claimer,
                params.defender,
                params.category,
                params.jurors_required,
                params.required_amount,
            ),
        );
        Ok(id)
    }

    pub fn pay_dispute(
        env: Env,
        payer: Address,
        dispute_id: u64,
        amount: i128,
    ) -> Result<(), ContractError> {
        payer.require_auth();
        let mut dispute = storage::get_dispute(&env, dispute_id)?;

        if amount != dispute.required_amount {
            return Err(ContractError::ErrInvalidAmount);
        }

        if payer == dispute.claimer {
            if dispute.claimer_paid {
                return Err(ContractError::ErrAlreadyPaid);
            }
            dispute.claimer_paid = true;
            dispute.claimer_amount = amount;
        } else if payer == dispute.defender {
            if dispute.defender_paid {
                return Err(ContractError::ErrAlreadyPaid);
            }
            dispute.defender_paid = true;
            dispute.defender_amount = amount;
        } else {
            return Err(ContractError::ErrUnauthorized);
        }

        if dispute.claimer_paid && dispute.defender_paid {
            dispute.status = DisputeStatus::Funded;
        }

        storage::set_dispute(&env, &dispute);
        env.events()
            .publish((PAID_TOPIC, dispute_id), (payer, amount));
        Ok(())
    }

    pub fn submit_evidence(
        env: Env,
        submitter: Address,
        dispute_id: u64,
        evidence_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        submitter.require_auth();
        let dispute = storage::get_dispute(&env, dispute_id)?;

        if submitter != dispute.claimer
            && submitter != dispute.defender
            && submitter != dispute.arbitrable
        {
            return Err(ContractError::ErrUnauthorized);
        }

        env.events()
            .publish((EVIDENCE_TOPIC, dispute_id), (submitter, evidence_hash));
        Ok(())
    }

    pub fn bind_remote_dispute(
        env: Env,
        local_dispute_id: u64,
        remote_dispute_id: u64,
    ) -> Result<(), ContractError> {
        require_relayer(&env)?;
        let mut dispute = storage::get_dispute(&env, local_dispute_id)?;

        if dispute.remote_dispute_id.is_some() {
            return Err(ContractError::ErrAlreadyBound);
        }

        if storage::get_local_id_by_remote(&env, remote_dispute_id).is_some() {
            return Err(ContractError::ErrRemoteAlreadyUsed);
        }

        dispute.remote_dispute_id = Some(remote_dispute_id);
        storage::set_dispute(&env, &dispute);
        storage::set_remote_binding(&env, remote_dispute_id, local_dispute_id);

        env.events()
            .publish((BOUND_TOPIC, local_dispute_id), remote_dispute_id);
        Ok(())
    }

    pub fn rule(env: Env, local_dispute_id: u64, ruling: u32) -> Result<(), ContractError> {
        require_relayer(&env)?;
        let mut dispute = storage::get_dispute(&env, local_dispute_id)?;

        if ruling > 1 {
            return Err(ContractError::ErrInvalidInput);
        }

        if dispute.remote_dispute_id.is_none() {
            return Err(ContractError::ErrRemoteMissing);
        }

        if dispute.ruling.is_some() {
            return Err(ContractError::ErrRulingAlreadySet);
        }

        dispute.ruling = Some(ruling);
        dispute.status = DisputeStatus::Ruled;
        storage::set_dispute(&env, &dispute);
        env.events()
            .publish((RULING_TOPIC, local_dispute_id), ruling);
        Ok(())
    }

    pub fn execute_rule(env: Env, local_dispute_id: u64) -> Result<(), ContractError> {
        let mut dispute = storage::get_dispute(&env, local_dispute_id)?;

        if dispute.rule_executed {
            return Err(ContractError::ErrAlreadyExecuted);
        }

        let ruling = dispute.ruling.ok_or(ContractError::ErrRulingMissing)?;
        let fn_name = Symbol::new(&env, "rule");
        let args = (local_dispute_id, ruling).into_val(&env);

        env.invoke_contract::<()>(&dispute.arbitrable, &fn_name, args);

        dispute.rule_executed = true;
        dispute.status = DisputeStatus::Executed;
        storage::set_dispute(&env, &dispute);
        env.events()
            .publish((EXECUTED_TOPIC, local_dispute_id), ruling);
        Ok(())
    }

    pub fn get_dispute(env: Env, local_dispute_id: u64) -> Result<ProxyDispute, ContractError> {
        storage::get_dispute(&env, local_dispute_id)
    }

    pub fn get_local_by_remote(env: Env, remote_dispute_id: u64) -> Option<u64> {
        storage::get_local_id_by_remote(&env, remote_dispute_id)
    }

    pub fn get_relayer(env: Env) -> Result<Address, ContractError> {
        Ok(storage::get_config(&env)?.relayer)
    }
}

fn require_admin(env: &Env) -> Result<(), ContractError> {
    let cfg = storage::get_config(env)?;
    cfg.admin.require_auth();
    Ok(())
}

fn require_relayer(env: &Env) -> Result<(), ContractError> {
    let cfg = storage::get_config(env)?;
    cfg.relayer.require_auth();
    Ok(())
}
