#![cfg(test)]

use soroban_sdk::{contract, contractimpl, contracttype, Env};

#[contracttype]
enum DataKey {
    LastDispute,
    LastRuling,
}

#[contract]
pub struct MockArbitrable;

#[contractimpl]
impl MockArbitrable {
    pub fn rule(env: Env, dispute_id: u64, ruling: u32) {
        env.storage()
            .instance()
            .set(&DataKey::LastDispute, &dispute_id);
        env.storage().instance().set(&DataKey::LastRuling, &ruling);
    }

    pub fn last_rule(env: Env) -> Option<(u64, u32)> {
        let dispute_id: Option<u64> = env.storage().instance().get(&DataKey::LastDispute);
        let ruling: Option<u32> = env.storage().instance().get(&DataKey::LastRuling);

        match (dispute_id, ruling) {
            (Some(d), Some(r)) => Some((d, r)),
            _ => None,
        }
    }
}
