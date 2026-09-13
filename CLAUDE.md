# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ME PERDÍ: a QR tag connects a lost pet or object to a secure public profile so a finder
can notify the owner without exposing the owner's private data. Full product spec (roles,
flows, business rules) lives in `docs/FUNCIONALIDAD.md` — read it before implementing any
feature that touches a flow you're not sure about; source comments throughout the codebase
reference it (e.g. "sección 7.5", "sección 9") as the source of truth for behavior.

npm workspaces monorepo:
- `apps/web` — React 19 + Vite + TanStack Router PWA (the actual product, Fase 0)
- `apps/api` — NestJS + TypeORM + Postgres (real backend, currently only covers the public
  tag profile endpoint — see "Two backends" below)
- `apps/contracts` — Solidity/Hardhat escrow contract for the optional on-chain reward,
  deployed to Hashkey (HSK) testnet, added for the Buildathon
- `packages/domain` — framework-free status machines / business rules shared by web and api
- `packages/validation` — Zod schemas shared by web and api
- `packages/api-client` — typed fetch client + response envelope used by the web app
- `packages/design-tokens`, `packages/analytics-events` — shared constants

## Commands

Run from the repo root unless noted. Root scripts fan out to workspaces via `-w`.

```
npm run dev              # apps/web dev server (Vite)
npm run dev:api          # apps/api dev server (Nest, watch mode)
npm run build            # builds packages/domain + packages/validation first, then all workspaces
npm run lint             # oxlint across all workspaces
npm run typecheck        # tsc --noEmit / tsc -b across all workspaces
npm run test             # vitest (web, domain, validation) across all workspaces
npm run test:e2e         # apps/web Playwright e2e suite
```

Single-workspace / single-test invocations:
```
npm run test -w packages/domain              # vitest run for one package
npm run test -w packages/domain -- tag.test  # single test file (vitest filter)
npm run test:watch -w apps/web               # vitest watch mode, web app
npx playwright test t/found -w apps/web      # single e2e spec
npm run lint -w apps/web                     # oxlint just the web app
```

`apps/contracts` (Hardhat, not part of the workspaces `test`/`lint` fanout target list you'd
normally touch unless working on the escrow):
```
npm run test -w apps/contracts               # hardhat test
npm run build -w apps/contracts              # hardhat compile
npm run deploy:testnet -w apps/contracts     # deploy RecoveryEscrow + MockUSDC to HSK testnet
```

`apps/api` database (TypeORM CLI, requires a running Postgres and `apps/api/.env` from
`.env.example`):
```
npm run migration:run -w apps/api
npm run migration:generate -w apps/api
npm run seed -w apps/api
```

## Architecture

### Two backends: mocks are the product today, Nest is the future

The web app is built against a mock backend (MSW — Mock Service Worker), not the real API.
`apps/web/src/main.tsx` starts MSW in **both dev and prod** whenever `VITE_ENABLE_MOCKS`
isn't explicitly `'false'`, because the real API only implements one endpoint so far. All
business logic — activation, return cases, rewards, admin, partner — currently lives in
`apps/web/src/mocks/db.ts` and `apps/web/src/mocks/handlers/*` (one handler file per role:
`public`, `auth`, `owner`, `reward`, `partner`, `admin`).

`apps/api` (NestJS) is the real backend being built incrementally. Today it implements only
`GET /public/tags/:publicSlug` (`apps/api/src/public/`), and its logic is written to
**exactly replicate** the equivalent function in the mock db (see the doc comment in
`apps/api/src/public/public.service.ts` pointing at `toPublicProfile()` in
`apps/web/src/mocks/db.ts`). When extending API coverage, keep behavior identical to the
matching mock handler, and when changing a mock handler, check whether the API needs the same
change. `packages/domain` and `packages/validation` exist precisely so both sides can share
the status-transition rules and input schemas instead of re-deriving them.

`packages/api-client` talks to whichever backend is active — MSW intercepts `fetch` in dev,
and against a same-origin deployment `VITE_API_BASE_URL` stays empty. All API responses use a
fixed envelope (`{ data, error, meta, requestId }`, see `packages/api-client/src/envelope.ts`);
`apiRequest()` throws `ApiRequestError` on any `error` field or non-ok status — callers only
ever see `data`.

### Domain model

Two state machines drive most of the app, both defined in `packages/domain`:
- `TagStatus` (`tag.ts`): `UNCLAIMED → ACTIVE → LOST → RETURN_PENDING → RETURNED`, plus
  `SUSPENDED`/`DEACTIVATED` side states. The public profile (what a scanning finder sees) is
  gated by `isPubliclyViewableTagStatus` — the QR **always** resolves off this stored status,
  never off scan counts. `SUSPENDED`/`DEACTIVATED`/`UNCLAIMED` must never expose item or
  contact data (enforced identically in the mock db and in `PublicService`).
- `ReturnCaseStatus` (`returnCase.ts`): `proposed → accepted → in_transit → delivered`, with
  `cancelled`/`disputed` branches. A reward can only be claimed after `delivered`
  (`canConfirmDelivery` requires `in_transit`), gated by a one-time 6-digit delivery code —
  never automatically.

`packages/validation` mirrors this with Zod schemas per flow (`activation`, `item`,
`contact`, `finder`, `returnCase`) — reuse these instead of writing ad hoc validation in a
component or a Nest DTO.

### apps/web structure

TanStack Router with file-based routes under `src/routes/` (route tree is generated into
`src/routeTree.gen.ts` — don't hand-edit it). Route groups by audience:
- `t/$publicSlug/*` — public finder-facing profile (no auth)
- `app/*` — owner's authenticated app (items, reports, profile)
- `admin/*` — internal admin panel
- `partner/*` — commercial ally portal
- `activate.$publicSlug`, `scan`, `onboarding.$step`, `return.$caseToken`,
  `reward.$claimToken`, `transfer.$token` — cross-cutting flows tied to a token/slug in the URL

State: `zustand` stores in `src/stores/` for client/wizard state (e.g.
`activationWizardStore`, `returnCaseStore`), `@tanstack/react-query` (via
`src/lib/queryClient.ts`) for server state through `packages/api-client`. UI primitives live
in `src/components/ui/`; feature-specific logic/components are grouped under `src/features/`
by flow (`activation`, `camera`, `finder`, `location`, `owner`, `scan`).

Feature flags (`src/lib/featureFlags.ts`) gate TikTok/Instagram login, blockchain rewards, and
the free reward dynamic via `VITE_FLAG_*` env vars — check this file before assuming a social
login or the blockchain reward path is reachable.

In dev, `src/mocks/DevScenarioPanel.tsx` + `src/stores/devScenario` (rendered from
`__root.tsx`) let you force `slow`/`error`/`offline` network conditions to exercise
loading/error/offline states without a real backend outage.

The app is a PWA (`vite-plugin-pwa`), but its service worker is disabled whenever MSW mocks
are enabled (`vite.config.ts`) — both would otherwise fight over the same `/` scope. It also
supports deploying to a subpath (not just domain root) via `VITE_BASE_PATH`, and the router's
`basepath` follows Vite's `BASE_URL` for the same reason — don't hardcode `/` in route links.

### apps/api structure

Standard Nest module layout: one module per domain area under `src/<area>/` (currently
`health`, `public`, `setup`), global `RequestIdMiddleware` and `AllExceptionsFilter` /
`EnvelopeInterceptor` in `src/common/` enforce the same response envelope the frontend expects
on every route. `ApiException` (`src/common/api-exception.ts`) is the way to throw a
domain-shaped error (`code`, `message`, HTTP status) instead of Nest's default.

`src/setup/` exposes a `GET /setup/run` "break-glass" endpoint to run migrations/seed on hosts
without shell access (cPanel), gated by a `SETUP_SECRET` env var that must be removed after
initial server setup — it fails closed (always denies) if unset.

TypeORM config is centralized in `src/database/typeorm-options.ts` and reused by both the Nest
module (`app.module.ts`) and the standalone CLI DataSource (`src/database/data-source.ts`) so
migration credentials never drift from the app's runtime config.

### apps/contracts

`RecoveryEscrow.sol` custodies an *optional* reward the owner sets when declaring a loss or
coordinating a return. Key invariants (see contract NatSpec): funds move only via
`createCase` (owner deposits) and `completeReturn` (only `VERIFIER_ROLE`, i.e. the backend,
after the same 6-digit delivery code flow used elsewhere in the app confirms delivery) or
`refundExpired` after the deadline. Nothing personally identifying (name, phone, location,
photos) is ever written on-chain — only amounts, statuses, timestamps, and an opaque
`bytes32 caseId`. A case with `rewardAmount == 0` still exists on-chain and completes
identically, so reward is never a requirement to help. `MockUSDC.sol` is the testnet stand-in
stablecoin used for demo rewards. Deploys to Hashkey testnet (`hskTestnet` in
`hardhat.config.ts`) via `scripts/deploy.ts`.

## Conventions

- TypeScript is strict everywhere (`tsconfig.base.json`): `noUncheckedIndexedAccess`,
  `noUnusedLocals`/`Parameters`, `verbatimModuleSyntax` (packages/web) — `apps/api` relaxes
  `verbatimModuleSyntax`/`isolatedModules` for Nest's decorator-based DI.
  `apps/contracts` has its own looser TS config for Hardhat.
  - `apps/web` and the shared `packages/*` — bundler resolution, ESM.
  - `apps/api` — CommonJS + experimental/emit decorator metadata (Nest requirement).
- Linting is `oxlint`, not ESLint, in every workspace.
  - Non-obvious note: `npm run build --workspaces --if-present` is invoked with
    `packages/domain`/`packages/validation` built first explicitly, because other workspaces
    depend on their compiled output, not their TS source, and workspace build order otherwise
    isn't guaranteed.
- Comments in this codebase frequently cite spec section numbers ("sección N") from the
  original product spec; `docs/FUNCIONALIDAD.md` is the version of that spec checked into
  this repo — treat it as authoritative for expected behavior, and note that some cited
  section numbers go beyond what's in that file (spec sections have been renumbered/trimmed
  over time; use content matching over exact numbers).
