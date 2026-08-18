export interface ChainConfig {
  chainIdHex: string;
  chainIdDecimal: number;
  chainName: string;
  rpcUrl: string;
  explorerUrl: string;
  contractAddress: string;
}

// Contract address is public, not a secret -- safe to check in directly.
// Reads VITE_CONTRACT_ADDRESS_STUDIONET first if set (e.g. via Vercel
// project environment variables, no committed .env required), falling
// back to the literal deployed address below. This means the app works
// immediately after clone with zero setup, while still leaving the
// env-var override path open for a future redeploy -- matching this
// project's own established, live-verified pattern.
//
// REDEPLOYED (Aug 18 2026): the steward-review fix (bounded
// reclaim_stake, deadline_ts, deterministic GitHub-field
// type-checking) is now live at this address. Not yet re-tested live
// via Run and Debug -- run the steward's five named test cases
// (payout, disagreement, fetch failure, replay, recovery) before
// resubmitting, not assumed correct from the code alone. Superseded
// addresses, kept only for reference:
// 0xA572D90194e5937caD8b0dE03A8D245784E5ADd5 (the version Pavel
// Kolosov's steward review actually looked at, requesting this fix).
//
// This project targets StudioNet exclusively (project knowledge
// section 7) -- Bradbury wiring (network toggle, dual ensureChain/
// RECEIPT_CONFIG branching) has been removed. A toggle with only one
// real network behind it is worse than no toggle at all.
const STUDIONET_CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS_STUDIONET ||
  '0xFB6167948c51F079Ad046a2DA99b480d70eBd6d2';

export const CHAIN: ChainConfig = {
  chainIdHex: '0xF22F', // 61999
  chainIdDecimal: 61999,
  chainName: 'GenLayer StudioNet',
  rpcUrl: 'https://studio.genlayer.com/api',
  explorerUrl: 'https://explorer-studio.genlayer.com',
  contractAddress: STUDIONET_CONTRACT_ADDRESS,
};

// Receipt-wait config -- GenLayer consensus genuinely takes real minutes,
// especially for any write triggering an LLM judgment (submit_attempt).
// Confirmed reasonable values per this project's established pattern.
export const RECEIPT_CONFIG = { retries: 120, interval: 4000 };

// Which write methods trigger a nondet/LLM judgment -- these need the
// "this can take several minutes" UI treatment. create_milestone and
// reclaim_stake are both fully deterministic (no LLM call), so neither
// belongs in this set -- only submit_attempt does.
export const NONDET_METHODS = new Set(['submit_attempt']);

// Fixed criterion type options -- must match the contract's
// _VALID_CRITERION_TYPES exactly (contracts/milestonevault.py). The
// targetPlaceholder for each now hints at the format
// _validate_target_for_criterion actually enforces contract-side, so a
// submission that would revert is visibly wrong before it's ever sent.
export const CRITERION_TYPES = [
  {
    value: 'star_count',
    label: 'Star count',
    targetLabel: 'Minimum stars',
    targetPlaceholder: 'e.g. 100 (whole number only)',
  },
  {
    value: 'pr_merged',
    label: 'PR merged',
    targetLabel: 'PR number',
    targetPlaceholder: 'e.g. 42 or #42 (numeric only)',
  },
  {
    value: 'release_tag',
    label: 'Release tag',
    targetLabel: 'Tag name',
    targetPlaceholder: 'e.g. v1.0.0 (no spaces)',
  },
] as const;

export type CriterionType = (typeof CRITERION_TYPES)[number]['value'];

// Deadline bounds -- must match the contract's _MIN_DEADLINE_DAYS /
// _MAX_DEADLINE_DAYS exactly (contracts/milestonevault.py). Enforced
// client-side too so an out-of-range value is visibly wrong before
// submission, not just a contract-side revert after a wallet round trip.
export const MIN_DEADLINE_DAYS = 1;
export const MAX_DEADLINE_DAYS = 3650;
