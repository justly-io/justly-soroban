use soroban_sdk::{contracttype, symbol_short, Address, BytesN, Symbol};

#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum DisputeStatus {
    Created = 0,
    Funded = 1,
    Ruled = 2,
    Executed = 3,
}

#[contracttype]
#[derive(Clone)]
pub struct Config {
    pub admin: Address,
    pub relayer: Address,
}

#[contracttype]
#[derive(Clone)]
pub struct ProxyDispute {
    pub id: u64,
    pub arbitrable: Address,
    pub claimer: Address,
    pub defender: Address,
    pub category: Symbol,
    pub root_evidence_hash: BytesN<32>,
    pub jurors_required: u32,
    pub pay_seconds: u64,
    pub evidence_seconds: u64,
    pub commit_seconds: u64,
    pub reveal_seconds: u64,
    pub required_amount: i128,
    pub claimer_paid: bool,
    pub defender_paid: bool,
    pub claimer_amount: i128,
    pub defender_amount: i128,
    pub remote_dispute_id: Option<u64>,
    pub ruling: Option<u32>,
    pub rule_executed: bool,
    pub status: DisputeStatus,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct CreateDisputeParams {
    pub arbitrable: Address,
    pub claimer: Address,
    pub defender: Address,
    pub category: Symbol,
    pub root_evidence_hash: BytesN<32>,
    pub jurors_required: u32,
    pub pay_seconds: u64,
    pub evidence_seconds: u64,
    pub commit_seconds: u64,
    pub reveal_seconds: u64,
    pub required_amount: i128,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Config,
    Counter,
    Dispute(u64),
    RemoteToLocal(u64),
}

pub const CREATED_TOPIC: &Symbol = &symbol_short!("CREATED");
pub const PAID_TOPIC: &Symbol = &symbol_short!("PAID");
pub const EVIDENCE_TOPIC: &Symbol = &symbol_short!("EVIDENCE");
pub const BOUND_TOPIC: &Symbol = &symbol_short!("BOUND");
pub const RULING_TOPIC: &Symbol = &symbol_short!("RULING");
pub const EXECUTED_TOPIC: &Symbol = &symbol_short!("EXECUTE");
