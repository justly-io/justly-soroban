# Justly Protocol Application

This project is the frontend implementation for **Justly**, a decentralized dispute resolution layer for digital businesses. It is built with Next.js and follows a multi-tenant architecture that supports both standard web usage and embedded Stellar MiniApp environments.

**Links**

- Docs: [docs.justly.one](https://docs.justly.one)
- App: [app.justly.one](https://app.justly.one)
- Testnet App: [dev.justly.one](https://dev.justly.one)
- Landing: [justly.one](https://justly.one)

---

## What is Justly?

Justly is a **neutral, programmable dispute resolution infrastructure** for platforms where value is exchanged. It combines:

- **Human judgment** (independent jurors),
- **Economic incentives** (stakes, rewards, penalties), and
- **Cryptographic enforcement** (deterministic on-chain execution).

The protocol is designed for low-to-medium value digital disputes where speed, fairness, and transparent execution are critical.

---

## Current Implementation Scope (MVP)

Live today:

- **Public Adversarial Disputes** (Claimer vs Defender)
- Commit-reveal voting
- On-chain execution of outcomes

Planned in future phases:

- Appeals and structured escalation rounds
- Decision disputes
- Rating-based evaluation
- Encrypted commit-reveal automation (Shutter API roadmap)
- Additional dispute privacy and specialization layers

---

## Dispute Lifecycle

Every dispute follows a deterministic lifecycle:

1. **Dispute Creation**
2. **Stake Deposit**
3. **Evidence Submission** (off-chain, cryptographically referenced on-chain)
4. **Juror Assignment**
5. **Commit Phase**
6. **Reveal Phase**
7. **Resolution and Execution**

In the current implementation, outcomes are final once executed.

---

## Dispute Types

| Type | Purpose | Outcome | Status |
|------|---------|---------|--------|
| Adversarial Dispute | Resolve conflicts between two parties | Winner / Loser | Live |
| Decision Dispute | Validate proposals or decisions | Accept / Reject | Planned |
| Rating Evaluation | Evaluate quality or contribution | Aggregated Score | Planned |

---

## Protocol Guarantees

Justly is designed to provide:

- **Neutrality**: independent juror judgment; no protocol-side evidence interpretation.
- **Incentive alignment**: coherent participation is rewarded, incoherent behavior is penalized.
- **Deterministic execution**: outcomes are enforced automatically by smart contracts.
- **Liveness**: disputes are designed to reach resolution without indefinite lock-ups.
- **Transparency and auditability**: rules and execution are verifiable on-chain.

---

## Dispute Tiers

Standardized tier profiles (protocol design):

| Tier | Jurors | Stake per Juror | Stake per Party | Fixed Fee | Security Level |
|------|--------|-----------------|-----------------|-----------|----------------|
| Tier 1 | 3 | 1 USD | 4 USD | 3 USD | Basic |
| Tier 2 | 5 | 5 USD | 10 USD | 5 USD | Medium |
| Tier 3 | 7 | 15 USD | 17 USD | 7 USD | High |
| Tier 4 | 9 | 25 USD | 29 USD | 9 USD | Very High |

Current implementation note: active deployments may use courts/categories and dispute parameters while preserving the same economic principles.

---

## Architecture: Multi-Tenant + Strategy Pattern

This application uses a strategy-based adapter layer for wallet and chain interactions. UI components remain wallet-agnostic and consume unified account/provider abstractions.

At protocol level, integrators interact with the **Stellar contract interface**. That Stellar contract acts as a **proxy layer**: disputes are opened from Stellar, routed to Justly's arbitration layer on **Base**, and the resulting ruling is applied back to the originating flow.

### Connection Strategy

| Strategy | Description | Used By |
|----------|-------------|---------|
| Stellar SDK | Uses `@stellar/stellar-sdk` with Freighter/Lobstr. | PWA, Stellar MiniApp |

### Supported Environments

| Platform | Subdomain | Connection Strategy | Auth Type |
|----------|-----------|---------------------|-----------|
| Standard PWA | `app.` | Stellar SDK | Freighter / Lobstr |
| Stellar MiniApp | `stellar.` | Stellar SDK | Freighter / Lobstr |

---

## Integration (For Developers)

Justly can be integrated as an arbitrator layer where your application or contract keeps custody/execution logic and delegates dispute judgment to the protocol.

High-level flow:

1. Open a dispute with required parameters.
2. Collect stake deposits and submit evidence references.
3. Wait for commit-reveal voting and protocol resolution.
4. Execute the resulting verdict in your app/protocol state machine.

For implementation details and contract patterns, see:

- [Implementing Justly in Web3 smart contracts](https://docs.justly.one/protocol/implementing-justly-web3-smart-contracts)

---

## Getting Started

### 1. Configure environment

Rename `.env.example` to `.env.local` and add your values.

```bash
NEXT_PUBLIC_APP_ENV="development" # or "production"

# Pinata / IPFS
NEXT_PUBLIC_PINATA_JWT="your_pinata_jwt"
NEXT_PUBLIC_PINATA_GATEWAY_URL="your_gateway_url"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"

# Stellar network configuration
NEXT_PUBLIC_STELLAR_NETWORK="testnet" # or "mainnet"
NEXT_PUBLIC_STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"

# Stellar contracts
NEXT_PUBLIC_STELLAR_JUSTLY_CONTRACT="C..."
NEXT_PUBLIC_STELLAR_USDC_CONTRACT="C..."
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run development server

```bash
pnpm dev
```

### 4. Apply Supabase migration (if needed)

```bash
supabase db push
```

Access locally:

- Standard mode: `http://localhost:3000`
- Stellar mode: `http://stellar.localhost:3000` (requires local host mapping)

---

## Application Configuration

The multi-environment logic is centered in `src/config/` and `src/adapters/`.

- `useWalletAdapter`: selects the active strategy by runtime context.
- `StellarAdapter`: wraps `@stellar/stellar-sdk` and Stellar-specific flows.
- `STELLAR_CONFIG` / `STELLAR_NETWORKS`: network and contract configuration.

---

## Smart Contract Development

Stellar contracts are in `contracts/`.

```bash
cd contracts/justly
stellar contract build
stellar contract deploy --network testnet
```

Run tests and optimize:

```bash
cargo test
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/justly.wasm
```

---

## Learn More

For protocol design, economics, security model, and use cases:

- [Introduction to Justly](https://docs.justly.one/index)
- [Current Implementation](https://docs.justly.one/protocol/current-implementation)
- [Protocol Guarantees](https://docs.justly.one/protocol/protocol-guarantees)
- [Security Model](https://docs.justly.one/protocol/security-model)
