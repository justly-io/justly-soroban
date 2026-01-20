# ⚖️ Slice Protocol Application

This project is the frontend implementation for **Slice**, a **Real-Time Dispute Resolution Protocol** built on Next.js. It features a **multi-tenant architecture** capable of running as a standalone PWA or as an embedded MiniApp across the **Stellar** ecosystem.

**🔗 Live Demo**: [Testnet](https://dev.slicehub.xyz) | [Mainnet](https://app.slicehub.xyz)

---

## ⚡ What is Slice?

**Slice** is a **decentralized, real-time dispute resolution protocol**. It acts as a **neutral truth oracle** that resolves disputes quickly and trustlessly through **randomly selected jurors** and **economic incentives**.

We are building the **"Uber for Justice"**:

- **Decentralized & Trustless:** No central authority controls the outcome.
- **Fast & Scalable:** Designed for real-time applications, offering quick rulings compared to traditional courts.
- **Gamified Justice:** Jurors enter the Dispute Resolution Market via an **intuitive and entertaining App/MiniApp**.
- **Earn by Ruling:** Users stake tokens to become jurors and **earn money** by correctly reviewing evidence and voting on disputes.

---

## 🏗️ Architecture: Multi-Tenant & Strategy Pattern

This application uses a **Strategy Pattern** to manage wallet connections and SDK interactions. Instead of a single monolithic connection logic, we use an abstraction layer that selects the appropriate **Adapter** based on the runtime environment (detected via subdomains and SDK presence).

### 1. Connection Strategies

We support the Stellar SDK for wallet connectivity:

| Strategy | Description | Used By |
|----------|-------------|---------|
| **Stellar SDK** | Uses `@stellar/stellar-sdk` and Freighter/Lobstr. | **PWA**, **Stellar MiniApp** |

### 2. Supported MiniApps & Environments

The application behaves differently depending on the access point (Subdomain) and injected providers.

| Platform | Subdomain | Connection Strategy | Auth Type |
|:---------|:----------|:-------------------|:----------|
| **Standard PWA** | `app.` | **Stellar SDK** | Freighter / Lobstr / **Passkey** 🆕 |
| **Stellar MiniApp** | `stellar.` | **Stellar SDK** | Freighter / Lobstr |

---

## 🚀 Try Slice Now

Experience the future of decentralized justice:

- **Testnet Demo**: [dev.slicehub.xyz](https://dev.slicehub.xyz)
- **Mainnet App**: [app.slicehub.xyz](https://app.slicehub.xyz)

---

## ⚖️ How It Works (The Juror Flow)

1. **Enter the Market:** Users open the Slice App or MiniApp and **stake tokens** (USDC/XLM) to join the juror pool.
2. **Get Drafted:** When a dispute arises, jurors are randomly selected (Drafted) to review the case.
3. **Review & Vote:** Jurors analyze the evidence provided by both parties and vote privately on the outcome.
4. **Earn Rewards:** If their vote aligns with the majority consensus, they **earn fees** from the losing party.
5. **Justice Served:** The protocol aggregates the votes and executes the ruling on-chain instantly.

---

## 🔌 Integration Guide (For Developers)

Integrating Slice into your protocol is as simple as 1-2-3:

### 1. Create a Dispute

Call `slice.createDispute(defender, category, ipfsHash, jurorsRequired)` from your Soroban contract.

### 2. Wait for Ruling

Slice handles the juror selection, voting, and consensus on-chain.

### 3. Read the Verdict

Once the dispute status is `Executed`, read the `winner` address from the contract state and execute your logic.

---

## 📍 Deployed Contracts

| Network | Slice Core | USDC Token |
|---------|------------|------------|
| **Stellar Testnet** | *Coming Soon* | *Coming Soon* |
| **Stellar Mainnet** | *Coming Soon* | *Coming Soon* |

---

## 🚀 Getting Started

### 1. Configure Environment

Rename `.env.example` to `.env.local` and add your keys.

```bash
NEXT_PUBLIC_APP_ENV="development" # or 'production'

# Pinata / IPFS Config
NEXT_PUBLIC_PINATA_JWT="your_pinata_jwt"
NEXT_PUBLIC_PINATA_GATEWAY_URL="your_gateway_url"

# Supabase Auth (For Passkeys & Email Auth) 🆕
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"

# Stellar Network Configuration
NEXT_PUBLIC_STELLAR_NETWORK="testnet" # or 'mainnet'
NEXT_PUBLIC_STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"

# Stellar Contracts
NEXT_PUBLIC_STELLAR_SLICE_CONTRACT="C..."
NEXT_PUBLIC_STELLAR_USDC_CONTRACT="C..."
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run Development Server

```bash
pnpm run dev
```

### 4. Set up Supabase (for Passkey Auth) 🆕

```bash
# Apply database migration
supabase db push
```

**Access the application:**

- **PWA Mode:** Open `http://localhost:3000`
- **Stellar Mode:** Use `http://stellar.localhost:3000` (requires host emulation)

---

## ⚙️ Application Configuration

The `src/config/` and `src/adapters/` directories manage the multi-environment logic.

### Abstraction Layer (`src/adapters/`)

We abstract wallet interactions behind a common interface:

- **`useWalletAdapter`** – Selects the active strategy based on environment.
- **`StellarAdapter`** – Wraps `@stellar/stellar-sdk` and Freighter (Soroban).

### Chain Configuration

- Exports `STELLAR_CONFIG` for Soroban RPCs and contract IDs.
- Exports `STELLAR_NETWORKS` for testnet/mainnet switching.

---

## 🔧 Smart Contract Development

- **Stellar:** `contracts/` (Soroban Rust SDK)

Build and deploy Soroban contracts:

```bash
cd contracts
soroban contract build
soroban contract deploy --network testnet
```

---

## 🗺️ Roadmap

- [x] Phase 1 – Foundation (Core Protocol, Web UI)
- [x] Phase 2 – Architecture Overhaul (Strategy Pattern, Multi-Tenant SDKs)
- [x] Phase 3 – **Stellar Integration** (Soroban Contracts + Freighter Adapter)
- [ ] Phase 4 – MiniApp Expansion (Lobstr, Additional Wallets)
- [ ] Phase 5 – **Slice V1.2 High-Stakes Lottery** (Global Passive Staking)
