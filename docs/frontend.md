# Frontend

React + Vite + TypeScript + Tailwind CSS + Framer Motion.

## Structure

- `src/config/chains.ts` — network config, contract addresses (env-var override with a hardcoded
  fallback, so the app works with zero setup).
- `src/hooks/useGenLayer.tsx` — wallet connection and contract read/write, centralized in a
  single context provider shared across the whole app.
- `src/hooks/useNetwork.tsx` — StudioNet/Bradbury toggle state.
- `src/lib/` — `ensureChain.ts` (wallet chain-switch, called at write time only), `timeoutError.ts`
  (typed timeout errors distinct from real failures), `contract.ts` (typed call-argument
  builders matching the contract's exact method signatures), `format.ts`.
- `src/components/` — `VaultDoor.tsx` (the signature visual element, tied to real milestone
  status), `Header.tsx`, `Footer.tsx`, `ErrorBoundary.tsx`, `TxStatus.tsx`.
- `src/pages/` — landing, new-milestone form, vaults list, vault detail, docs, 404.

## Config

No `.env` file is required to run this locally or deploy it. `chains.ts` reads
`VITE_CONTRACT_ADDRESS_STUDIONET`/`VITE_CONTRACT_ADDRESS_BRADBURY` first if set, falling back to
the real deployed addresses as literals. Set the env vars directly as Vercel project environment
variables if you redeploy the contract and want to point at a new address without editing
`chains.ts` — both paths work.

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
