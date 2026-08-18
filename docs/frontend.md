# Frontend

React + Vite + TypeScript + Tailwind CSS + Framer Motion.

## Structure

- `src/config/chains.ts` — network config, contract address (env-var override with a hardcoded
  fallback, so the app works with zero setup). StudioNet only.
- `src/hooks/useGenLayer.tsx` — wallet connection and contract read/write, centralized in a
  single context provider shared across the whole app.
- `src/lib/` — `ensureChain.ts` (wallet chain-switch, called at write time only), `timeoutError.ts`
  (typed timeout errors distinct from real failures), `contract.ts` (typed call-argument
  builders matching the contract's exact method signatures), `format.ts`.
- `src/components/` — `VaultDoor.tsx` (the signature visual element, tied to real milestone
  status — now a four-state door: locked, pending, released, reclaimed), `Header.tsx`,
  `Footer.tsx`, `ErrorBoundary.tsx`, `TxStatus.tsx`.
- `src/pages/` — landing, new-milestone form, vaults list, vault detail, docs, 404.

## Config

No `.env` file is required to run this locally or deploy it. `chains.ts` reads
`VITE_CONTRACT_ADDRESS_STUDIONET` first if set, falling back to the real deployed address as a
literal. Set the env var directly as a Vercel project environment variable if you redeploy the
contract and want to point at a new address without editing `chains.ts` — both paths work.

This project previously deployed to both StudioNet and Bradbury, with a `useNetwork.tsx`
provider and a network toggle in the header. That's been removed — this app now targets
StudioNet exclusively, per the project's own standing rule that a network toggle with only one
real network behind it is worse than no toggle at all. If a future rebuild genuinely needs
multi-network support again, that provider and toggle would need to be rebuilt, not restored
from history — the current codebase has no dormant Bradbury path sitting unused.

## Known limitation

`VaultsListPage` has no dedicated list view on the contract to call — it reads `get_next_id()`
then fetches each `get_milestone(id)` individually. Fine at this project's expected scale; would
need a narrow index-TreeMap pattern (see the project's own contract-pattern notes) if record
counts grew large.

## Setup

```bash
cd frontend
npm install
npm run dev
```
