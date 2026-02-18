# Slice Protocol – Developer & Agent Guidelines

This document defines the architectural rules, development standards, and technical constraints for the Slice Protocol frontend and smart contract system.

---

## Architectural Principles

### 1. Multi-Tenant Strategy Pattern

This application runs across multiple environments (PWA, **Stellar MiniApp**) using a single codebase.

> **Rule:** Do **not** use conditional logic inside UI components (e.g., `if (isStellar)`).

#### Design Requirements

**Abstraction Layer**

All wallet interactions must go through a dedicated adapter layer and a single unified provider component. UI components must never talk directly to wallet SDKs or RPC providers.

**Tenant Detection**

Tenants are detected using request metadata (such as host, origin, or runtime signals) and resolved before any wallet or chain logic is initialized.

**Strategies**

- **Web / PWA / Stellar MiniApp** → `Stellar SDK` + `Freighter` (Soroban)

---

### 2. State Management

**On-chain data**

- **Stellar:** Use **Soroban React** hooks or direct SDK calls via the Adapter.

Combined with **TanStack Query** for caching and synchronization.

**Local state**

Use typed LocalStorage helpers for temporary client-side data (for example commit-reveal salts and voting metadata).

**Client / Server separation**

- Blockchain hooks → **Client Components only** (`"use client"`)
- Server Components → layout, static data, or configuration only

---

## Tech Stack & Standards

- **Framework:** Next.js 16 (App Router)
- **Blockchain interaction:**
  - **Stellar:** @stellar/stellar-sdk (Soroban)

- **Styling:** Tailwind CSS + shadcn/ui
  - **UI rule:** Avoid `text-sm` for body copy in embedded contexts (MiniApps)
  - Prefer `text-base` for readability

- **Authentication:**
  - Freighter/Lobstr → Stellar
  - Passkeys → Supabase Auth

### Required Standards

- **Soroban** → Rust Smart Contracts (Stellar integration)
- **SEP-0007** → Stellar URI scheme for deep linking
- **SEP-0010** → Stellar Web Authentication

---

## Development Workflows

### 1. Running the App

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

**Access the application:**

- **Standard mode:** `http://localhost:3000`
- **Stellar mode:** Access via `stellar.` subdomain (local DNS mapping required).

---

### 2. Smart Contract Development

**Soroban (Stellar)**

```bash
cd contracts/justly
soroban contract build
soroban contract deploy --network testnet
soroban contract invoke --id C... --fn get_dispute -- --dispute_id 1
```

**Testing Contracts**

```bash
cargo test
soroban contract optimize --wasm target/wasm32-unknown-unknown/release/justly.wasm
```

---

### 3. IPFS & Evidence Handling

Dispute metadata is stored on IPFS using **Pinata**.

**Rules:**

- Always use the shared IPFS utility module provided by the application to ensure consistent metadata formatting and error handling.

  ```
  src/util/ipfs.ts
  ```

- Evidence JSON must match the `DisputeUI` interface used by the frontend to guarantee correct decoding and rendering.

  ```
  src/util/disputeAdapter.ts
  ```

---

## Coding Conventions

### Component Rules

1. **Wallet-agnostic**

   Components must consume `useSliceAccount` and never depend on connection method or specific chain logic directly.

2. **Strict typing**

   Use `DisputeUI` for all frontend dispute representations.

3. **Error handling**

   Use `sonner` for user-facing notifications:

   ```ts
   toast.error("Message")
   ```

4. **Stellar-specific**

   - Always handle XDR encoding/decoding with proper error boundaries
   - Use stroops (1 XLM = 10,000,000 stroops) for all amount calculations
   - Validate account addresses using `StrKey.isValidEd25519PublicKey()`

---

### Commit Messages

Follow **Conventional Commits**:

```text
feat(adapter): add stellar freighter support
fix(voting): resolve salt generation issue
style(ui): update font sizes for mobile
chore(contracts): recompile soroban contracts
```

---

## Environment Configuration

> **DO NOT COMMIT SECRETS**

The application requires several environment variables for:

- Runtime mode selection (development vs production)
- Authentication providers
- IPFS / storage backends
- Stellar network configuration (Testnet/Mainnet)
- Soroban RPC endpoints
- Horizon API endpoints

These values must be provided via your local environment configuration mechanism and deployment platform secrets.

---

## Stellar-Specific Guidelines

### Network Configuration

- **Testnet:** Use for all development and testing
- **Mainnet:** Production deployments only
- Always specify network passphrase explicitly in contract calls

### Transaction Building

- Use `TransactionBuilder` from `@stellar/stellar-sdk`
- Set appropriate timeouts (default: 180 seconds)
- Always simulate transactions before submission
- Handle authorization entries for smart contract invocations

### Asset Handling

- Native asset: `Asset.native()` for XLM
- Custom assets: Validate issuer and asset code
- USDC: Use Stellar-native USDC contract address

---

**This file is authoritative. Any architectural change must update this document.**
