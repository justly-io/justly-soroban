#![cfg(test)]

extern crate std;

use crate::tests::mock_arbitrable::{MockArbitrable, MockArbitrableClient};
use crate::types::{CreateDisputeParams, DisputeStatus};
use crate::{JustlyProxy, JustlyProxyClient};
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env, Symbol};

fn setup() -> Env {
    let env = Env::default();
    env.mock_all_auths();
    env
}

fn deploy_proxy<'a>(env: &Env, admin: &Address, relayer: &Address) -> JustlyProxyClient<'a> {
    let id = env.register(JustlyProxy, (admin.clone(), relayer.clone()));
    JustlyProxyClient::new(env, &id)
}

fn deploy_mock_arbitrable<'a>(env: &Env) -> MockArbitrableClient<'a> {
    let id = env.register(MockArbitrable, ());
    MockArbitrableClient::new(env, &id)
}

fn create_params(
    env: &Env,
    arbitrable: &Address,
    claimer: &Address,
    defender: &Address,
    amount: i128,
) -> CreateDisputeParams {
    CreateDisputeParams {
        arbitrable: arbitrable.clone(),
        claimer: claimer.clone(),
        defender: defender.clone(),
        category: Symbol::new(env, "General"),
        root_evidence_hash: BytesN::from_array(env, &[1u8; 32]),
        jurors_required: 5,
        pay_seconds: 3600,
        evidence_seconds: 3600,
        commit_seconds: 3600,
        reveal_seconds: 3600,
        required_amount: amount,
    }
}

#[test]
fn test_create_dispute_and_read_state() {
    let env = setup();
    let admin = Address::generate(&env);
    let relayer = Address::generate(&env);
    let claimer = Address::generate(&env);
    let defender = Address::generate(&env);
    let arbitrable = deploy_mock_arbitrable(&env);

    let client = deploy_proxy(&env, &admin, &relayer);
    let params = create_params(&env, &arbitrable.address, &claimer, &defender, 1_000_000);
    let dispute_id = client.create_dispute(&params);

    let dispute = client.get_dispute(&dispute_id);
    assert_eq!(dispute.id, dispute_id);
    assert_eq!(dispute.claimer, claimer);
    assert_eq!(dispute.defender, defender);
    assert_eq!(dispute.required_amount, 1_000_000);
    assert!(dispute.status == DisputeStatus::Created);
    assert!(!dispute.claimer_paid);
    assert!(!dispute.defender_paid);
    assert!(dispute.remote_dispute_id.is_none());
    assert!(dispute.ruling.is_none());
}

#[test]
fn test_create_dispute_validation() {
    let env = setup();
    let admin = Address::generate(&env);
    let relayer = Address::generate(&env);
    let user = Address::generate(&env);
    let arbitrable = deploy_mock_arbitrable(&env);
    let client = deploy_proxy(&env, &admin, &relayer);

    let mut same_party = create_params(&env, &arbitrable.address, &user, &user, 1_000_000);
    let res = client.try_create_dispute(&same_party);
    assert!(res.is_err());

    same_party = create_params(
        &env,
        &arbitrable.address,
        &user,
        &Address::generate(&env),
        0,
    );
    let res = client.try_create_dispute(&same_party);
    assert!(res.is_err());

    let mut zero_jurors = create_params(
        &env,
        &arbitrable.address,
        &user,
        &Address::generate(&env),
        1_000_000,
    );
    zero_jurors.jurors_required = 0;
    let res = client.try_create_dispute(&zero_jurors);
    assert!(res.is_err());
}

#[test]
fn test_pay_dispute_requires_exact_amount_and_full_funding() {
    let env = setup();
    let admin = Address::generate(&env);
    let relayer = Address::generate(&env);
    let claimer = Address::generate(&env);
    let defender = Address::generate(&env);
    let third_party = Address::generate(&env);
    let arbitrable = deploy_mock_arbitrable(&env);
    let client = deploy_proxy(&env, &admin, &relayer);

    let amount = 5_000_000;
    let params = create_params(&env, &arbitrable.address, &claimer, &defender, amount);
    let dispute_id = client.create_dispute(&params);

    let wrong_amount = amount - 1;
    let res = client.try_pay_dispute(&claimer, &dispute_id, &wrong_amount);
    assert!(res.is_err());

    let res = client.try_pay_dispute(&third_party, &dispute_id, &amount);
    assert!(res.is_err());

    client.pay_dispute(&claimer, &dispute_id, &amount);
    let dispute = client.get_dispute(&dispute_id);
    assert!(dispute.claimer_paid);
    assert!(!dispute.defender_paid);
    assert!(dispute.status == DisputeStatus::Created);

    let res = client.try_pay_dispute(&claimer, &dispute_id, &amount);
    assert!(res.is_err());

    client.pay_dispute(&defender, &dispute_id, &amount);
    let dispute = client.get_dispute(&dispute_id);
    assert!(dispute.claimer_paid);
    assert!(dispute.defender_paid);
    assert!(dispute.status == DisputeStatus::Funded);
}

#[test]
fn test_submit_evidence_permissions() {
    let env = setup();
    let admin = Address::generate(&env);
    let relayer = Address::generate(&env);
    let claimer = Address::generate(&env);
    let defender = Address::generate(&env);
    let stranger = Address::generate(&env);
    let arbitrable = deploy_mock_arbitrable(&env);
    let client = deploy_proxy(&env, &admin, &relayer);

    let params = create_params(&env, &arbitrable.address, &claimer, &defender, 1_000_000);
    let dispute_id = client.create_dispute(&params);
    let evidence = BytesN::from_array(&env, &[2u8; 32]);

    client.submit_evidence(&claimer, &dispute_id, &evidence);
    client.submit_evidence(&defender, &dispute_id, &evidence);
    client.submit_evidence(&arbitrable.address, &dispute_id, &evidence);

    let res = client.try_submit_evidence(&stranger, &dispute_id, &evidence);
    assert!(res.is_err());
}

#[test]
fn test_remote_binding_and_lookup() {
    let env = setup();
    let admin = Address::generate(&env);
    let relayer = Address::generate(&env);
    let arbitrable = deploy_mock_arbitrable(&env);
    let client = deploy_proxy(&env, &admin, &relayer);

    let p1 = create_params(
        &env,
        &arbitrable.address,
        &Address::generate(&env),
        &Address::generate(&env),
        1_000_000,
    );
    let p2 = create_params(
        &env,
        &arbitrable.address,
        &Address::generate(&env),
        &Address::generate(&env),
        1_000_000,
    );

    let d1 = client.create_dispute(&p1);
    let d2 = client.create_dispute(&p2);

    client.bind_remote_dispute(&d1, &100);
    assert_eq!(client.get_local_by_remote(&100), Some(d1));

    let res = client.try_bind_remote_dispute(&d1, &101);
    assert!(res.is_err());

    let res = client.try_bind_remote_dispute(&d2, &100);
    assert!(res.is_err());
}

#[test]
fn test_rule_requires_remote_and_allows_single_assignment() {
    let env = setup();
    let admin = Address::generate(&env);
    let relayer = Address::generate(&env);
    let arbitrable = deploy_mock_arbitrable(&env);
    let client = deploy_proxy(&env, &admin, &relayer);

    let params = create_params(
        &env,
        &arbitrable.address,
        &Address::generate(&env),
        &Address::generate(&env),
        1_000_000,
    );
    let dispute_id = client.create_dispute(&params);

    let res = client.try_rule(&dispute_id, &1);
    assert!(res.is_err());

    client.bind_remote_dispute(&dispute_id, &501);

    let res = client.try_rule(&dispute_id, &2);
    assert!(res.is_err());

    client.rule(&dispute_id, &1);
    let dispute = client.get_dispute(&dispute_id);
    assert_eq!(dispute.ruling, Some(1));
    assert!(dispute.status == DisputeStatus::Ruled);

    let res = client.try_rule(&dispute_id, &0);
    assert!(res.is_err());
}

#[test]
fn test_execute_rule_calls_arbitrable_and_is_idempotent() {
    let env = setup();
    let admin = Address::generate(&env);
    let relayer = Address::generate(&env);
    let claimer = Address::generate(&env);
    let defender = Address::generate(&env);
    let arbitrable = deploy_mock_arbitrable(&env);
    let client = deploy_proxy(&env, &admin, &relayer);

    let params = create_params(&env, &arbitrable.address, &claimer, &defender, 1_000_000);
    let dispute_id = client.create_dispute(&params);

    let res = client.try_execute_rule(&dispute_id);
    assert!(res.is_err());

    client.bind_remote_dispute(&dispute_id, &700);
    client.rule(&dispute_id, &1);
    client.execute_rule(&dispute_id);

    let dispute = client.get_dispute(&dispute_id);
    assert!(dispute.rule_executed);
    assert!(dispute.status == DisputeStatus::Executed);

    let observed = arbitrable.last_rule();
    assert_eq!(observed, Some((dispute_id, 1)));

    let res = client.try_execute_rule(&dispute_id);
    assert!(res.is_err());
}
