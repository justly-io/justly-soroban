use crate::error::ContractError;
use crate::types::{Config, DataKey, ProxyDispute};
use soroban_sdk::Env;

pub fn set_config(env: &Env, cfg: &Config) {
    env.storage().instance().set(&DataKey::Config, cfg);
}

pub fn get_config(env: &Env) -> Result<Config, ContractError> {
    env.storage()
        .instance()
        .get(&DataKey::Config)
        .ok_or(ContractError::ErrConfigMissing)
}

pub fn set_counter(env: &Env, count: u64) {
    env.storage().instance().set(&DataKey::Counter, &count);
}

pub fn get_counter(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::Counter)
        .unwrap_or(0u64)
}

pub fn next_dispute_id(env: &Env) -> u64 {
    let next = get_counter(env) + 1;
    set_counter(env, next);
    next
}

pub fn set_dispute(env: &Env, dispute: &ProxyDispute) {
    env.storage()
        .instance()
        .set(&DataKey::Dispute(dispute.id), dispute);
}

pub fn get_dispute(env: &Env, dispute_id: u64) -> Result<ProxyDispute, ContractError> {
    env.storage()
        .instance()
        .get(&DataKey::Dispute(dispute_id))
        .ok_or(ContractError::ErrNotFound)
}

pub fn get_local_id_by_remote(env: &Env, remote_dispute_id: u64) -> Option<u64> {
    env.storage()
        .instance()
        .get(&DataKey::RemoteToLocal(remote_dispute_id))
}

pub fn set_remote_binding(env: &Env, remote_dispute_id: u64, local_dispute_id: u64) {
    env.storage().instance().set(
        &DataKey::RemoteToLocal(remote_dispute_id),
        &local_dispute_id,
    );
}
