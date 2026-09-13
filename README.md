# I'M LOST On-Chain (Buildathon Ethereum Bolivia 2026)

## What is ME PERDÍ?

I'M LOST (ME PERDÍ) connects a physical QR tag to a secure digital profile so a lost pet or valuable object can find its way back to its owner. It works for anything important: phones, backpacks, laptops, bicycles, cameras, musical instruments, luggage, keys, wallets, tools, documents — anything someone wants to protect with the possibility that a stranger can return it without friction.

**Core principle:** I'M LOST rewards safe returns, never incentivizes going out to look for pets or objects for money.

## The Principle: Reward the Return, Not the Search

Every product decision filters through this:

- The reward is always optional and set by the owner when creating the case — never chosen by the platform.
- Payment releases only when a verifiable condition is met (the same 6-digit handoff code the app already uses), never by an automated service's discretion.
- No public rankings, no exposure of how much anyone "earns" by helping.
- Nothing personal is stored on-chain: no names, phones, exact locations, photos, or messages. Only amounts, states, dates, and a caseId that is a hash (bytes32), not readable text.
- A single case cannot be paid twice.
- A case with no reward completes exactly the same way — the reward is always optional, never a requirement to help.

## Tracks

- Bolivia Hackathon (base registration, mandatory)
- EAG Global — Real-World Ethereum Applications: community coordination, contribution registry, apps for emerging regions
- HSK Chain — sub-track Payment and Stablecoins

Double registration required: Devfolio Ethereum Bolivia and official Devfolio EAG, selecting the same tracks.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend      │     │    Backend       │     │   Blockchain     │
│   (React +      │◄───►│   (NestJS +      │◄───►│   (HSK Testnet)  │
│   TanStack)     │     │   TypeORM +      │     │   MockUSDC       │
│   PWA           │     │   PostgreSQL)    │     │   RecoveryEscrow │
└─────────────────┘     └──────────────────┘     └──────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
   /return/:caseToken      POST /api/chain/cases      createCase()
   verifyHandoffCode()     POST /api/chain/           completeReturn()
   completeChainReturn()   complete-return            refundExpired()
```

## What Existed Before the Buildathon

ME PERDÍ is a real product in production (profile público de tag). Before this event, the repo already had:

- Frontend: React + TanStack Router + Vite, PWA, QR scanning, tag activation wizard, public profiles, finder reports, location sharing, messages, return case flow with 6-digit handoff code, reward claim (gift token from sponsors, simulated).
- Backend: NestJS + TypeORM + PostgreSQL, REST API with envelope pattern, auth (OAuth + magic links), tag/item management, public profiles, finder reports, return cases, admin/partner portals (simulated).
- Shared packages: domain types, validation schemas (Zod), design tokens, api-client.

## What Was Built During the Buildathon (P0)

1. **Smart Contracts** (`apps/contracts/`)
   - `MockUSDC.sol` — ERC-20 test token (6 decimals, clearly labeled as test, no real value)
   - `RecoveryEscrow.sol` — Escrow with AccessControl (DEFAULT_ADMIN_ROLE, VERIFIER_ROLE), Pausable, ReentrancyGuard
     - `createCase(bytes32 caseId, address token, uint256 rewardAmount, uint64 deadline)` — funds transferred from caller (or demo owner wallet)
     - `completeReturn(bytes32 caseId, address helper)` — VERIFIER_ROLE only, releases reward to helper
     - `refundExpired(bytes32 caseId)` — anyone can call after deadline, returns funds to owner
     - `getCase(bytes32 caseId)` — public read for audit
   - Tests: 9 critical cases passing (funding, zero reward, double complete, only verifier, pause/unpause, refund timing, duplicate caseId)
   - Deployed to HSK testnet (chainId 133), source verified on Blockscout

2. **Backend Blockchain Module** (`apps/api/src/blockchain/`)
   - `ChainService` — ethers v6, JsonRpcProvider to HSK testnet, verifier + demo owner wallets, typed contract instances
   - `CaseOtpService` — in-memory 6-digit OTP store (hash only, 24h TTL, max 5 attempts, single-use)
   - `BlockchainController` — two endpoints protected by shared secret (`CHAIN_DEMO_SECRET`):
     - `POST /api/chain/cases` — creates demo escrow case, returns `{ caseId, code, txHash, explorerUrl }`
     - `POST /api/chain/complete-return` — verifies OTP, calls `completeReturn` on-chain, returns `{ txHash, explorerUrl, rewardAmount }`
   - Integrated with existing envelope interceptor and ApiException pattern

3. **Frontend Integration** (`apps/web/`, `packages/api-client/`)
   - `chainApi.ts` — typed client for the two endpoints
   - `return.$caseToken.tsx` — when case is delivered and `hasReward === true`, shows wallet address input + "Receive reward" button; calls `completeChainReturn`, displays tx hash, explorer link, and amount

4. **Deployment**
   - Contracts deployed to HSK testnet:
     - MockUSDC: `0x902f9814d334e3c61a57962381DbE6f2f64946f1`
     - RecoveryEscrow: `0x42CaC70563DaA7a0833d8F22413bD8dBA0Dd0888`
   - Verified on Blockscout testnet explorer

## Deployed Contracts

| Contract | Address | Verified |
|----------|---------|----------|
| MockUSDC | `0x902f9814d334e3c61a57962381DbE6f2f64946f1` | ✅ |
| RecoveryEscrow | `0x42CaC70563DaA7a0833d8F22413bD8dBA0Dd0888` | ✅ |

Explorer: https://testnet-explorer.hsk.xyz

## How to Install and Run

### Prerequisites
- Node.js 22+
- pnpm (or npm)
- PostgreSQL (for backend)
- HSK testnet wallets with test HSK for gas

### Contracts
```bash
cd apps/contracts
cp .env.example .env
# Fill DEPLOYER_PRIVATE_KEY, VERIFIER_ADDRESS, DEMO_OWNER_ADDRESS
npm install
npx hardhat test          # Run tests
npx hardhat run scripts/deploy.ts --network hskTestnet  # Deploy
npx hardhat verify --network hskTestnet <address>       # Verify
```

### Backend
```bash
cd apps/api
cp .env.example .env
# Fill DB credentials, HSK_RPC_URL, RECOVERY_ESCROW_ADDRESS, MOCK_USDC_ADDRESS,
# VERIFIER_PRIVATE_KEY, DEMO_OWNER_PRIVATE_KEY, CHAIN_DEMO_SECRET
npm install
npm run build
npm run start:dev
```

### Frontend
```bash
cd apps/web
npm install
npm run dev
```

### Run Contract Tests
```bash
cd apps/contracts
npx hardhat test
# Expected: 10 passing (9 required + decimals check)
```

## Demo Script

1. **Create a demo case with reward**
   ```bash
   curl -X POST "http://localhost:3000/api/chain/cases?key=dev-secret-change-in-prod" \
     -H "Content-Type: application/json" \
     -d '{"itemName": "Collar de Luna", "rewardAmount": "10"}'
   # Returns: { caseId, code, txHash, explorerUrl }
   ```

2. **Open the return screen** (simulated finder)
   - Navigate to `/return/<caseToken>` in the web app
   - Enter the 6-digit code → "Confirmar entrega"
   - Status changes to "Código verificado. Esperando confirmación del propietario."

3. **Complete the return and claim reward**
   - Owner confirms delivery in their panel (or via backend)
   - Finder sees "¡Volvió a casa!" + "Recompensa on-chain disponible" block
   - Enter wallet address (0x...) → "Recibir recompensa"
   - See: amount, tx hash, link to Blockscout explorer

4. **Case without reward**
   - Create with `"rewardAmount": "0"` or omit
   - Completes exactly the same — no extra steps, no wallet input shown

## Known Limitations (Documented as Roadmap)

- **Handoff code instead of owner EIP-712 signature** — The owner shares a 6-digit code in person; a production version would use cryptographic signature from the owner's wallet.
- **OTP in memory instead of database** — The 6-digit code hash/state lives in a Map; needs PostgreSQL persistence for production.
- **Wallet address pasted manually** — No MetaMask/WalletConnect integration; finder pastes 0x address. Deliberate for demo reliability.
- **Testnet only** — Deployed on HSK testnet (chainId 133). Mainnet (chainId 177) deploy only after full testnet validation.
- **Demo owner wallet** — Backend uses a custodial wallet to create cases and mint mUSDC. Real flow: owner signs with their own wallet.
- **No risk signal** — P0 skips automated risk scoring; falls back to manual review.
- **No sponsor liquidation on-chain** — Partner payouts still off-chain.

## Roadmap (P1 / P2)

- P1: Simple risk signal before release (never decides alone, falls back to manual); option to donate reward back to community fund; public aggregate dashboard (total fund, cases resolved, no personal data).
- P2: Mainnet deploy; on-chain partner liquidation; private optional recognition for helpers (no public leaderboard).

## Environment Variables

### Contracts (`apps/contracts/.env`)
```
HSK_RPC_URL=https://testnet.hsk.xyz
DEPLOYER_PRIVATE_KEY=        # Deployer wallet (needs test HSK)
VERIFIER_ADDRESS=            # Backend verifier wallet address
DEMO_OWNER_ADDRESS=          # Demo owner wallet (receives test mUSDC)
DEMO_MINT_AMOUNT=1000        # mUSDC to mint (human-readable)
```

### Backend (`apps/api/.env`)
```
HSK_RPC_URL=https://testnet.hsk.xyz
HSK_CHAIN_ID=133
RECOVERY_ESCROW_ADDRESS=0x42CaC70563DaA7a0833d8F22413bD8dBA0Dd0888
MOCK_USDC_ADDRESS=0x902f9814d334e3c61a57962381DbE6f2f64946f1
VERIFIER_PRIVATE_KEY=        # Verifier wallet (only calls completeReturn)
DEMO_OWNER_PRIVATE_KEY=      # Demo owner wallet (creates cases, approves tokens)
CHAIN_DEMO_SECRET=dev-secret-change-in-prod
```

## License

Private — ME PERDÍ team.
