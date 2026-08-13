export type NetworkKey = 'studionet' | 'bradbury';

export interface ChainConfig {
  key: NetworkKey;
  label: string;
  chainIdHex: string;
  chainIdDecimal: number;
  chainName: string;
  rpcUrl: string;
  explorerUrl: string;
  contractAddress: string;
}

// Contract addresses are public, not secrets -- safe to check in directly.
// Reads VITE_CONTRACT_ADDRESS_* first if set (e.g. via Vercel project
// environment variables, no committed .env required), falling back to the
// literal deployed address below. This means the app works immediately
// after clone with zero setup, while still leaving the env-var override
// path open for a future redeploy -- matching this project's own
// established, live-verified pattern (see chains.ts on the Recourse
// build), not a hardcoded-only shortcut.
//
// REDEPLOYED (Aug 13 2026): attempt 1's fix (bigger fetch cap, guessed
// HTML markup patterns) was insufficient -- confirmed by live re-test,
// not assumed. These addresses run attempt 2's fix: evidence source
// switched from scraping rendered GitHub HTML to GitHub's own REST API
// (clean JSON, confirmed against GitHub's official docs). Not yet
// re-tested live. Superseded addresses, kept only for reference:
// StudioNet 0x750DED02407b0Fd4EE6629C0FF41b8413a9c4e37 (attempt 1),
// 0xC2F792A48E39122E82b082cbaE0Eb019692206cb (original, pre-attempt-1);
// Bradbury 0x9C58eB70Bf744969f2712552fF2958bfB9e5aA06 (attempt 1),
// 0x759C60e3F8d1aAeafE6D55F820D1EAcc54aA95F2 (original, pre-attempt-1).
const STUDIONET_CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS_STUDIONET ||
  '0xA572D90194e5937caD8b0dE03A8D245784E5ADd5';

const BRADBURY_CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS_BRADBURY ||
  '0xa010508a7A294De55B5C89999b9d6347bd0B4688';

export const CHAINS: Record<NetworkKey, ChainConfig> = {
  studionet: {
    key: 'studionet',
    label: 'StudioNet',
    chainIdHex: '0xF22F', // 61999
    chainIdDecimal: 61999,
    chainName: 'GenLayer StudioNet',
    rpcUrl: 'https://studio.genlayer.com/api',
    explorerUrl: 'https://explorer-studio.genlayer.com',
    contractAddress: STUDIONET_CONTRACT_ADDRESS,
  },
  bradbury: {
    key: 'bradbury',
    label: 'Bradbury',
    chainIdHex: '0x107D', // 4221
    chainIdDecimal: 4221,
    chainName: 'GenLayer Bradbury',
    rpcUrl: 'https://rpc-bradbury.genlayer.com',
    explorerUrl: 'https://explorer-bradbury.genlayer.com',
    contractAddress: BRADBURY_CONTRACT_ADDRESS,
  },
};

export const DEFAULT_NETWORK: NetworkKey = 'studionet';

// Receipt-wait config -- GenLayer consensus genuinely takes real minutes,
// especially for any write triggering an LLM judgment (submit_attempt).
// Confirmed reasonable values per this project's established pattern.
export const RECEIPT_CONFIG: Record<NetworkKey, { retries: number; interval: number }> = {
  studionet: { retries: 120, interval: 4000 },
  bradbury: { retries: 240, interval: 6000 },
};

// Which write methods trigger a nondet/LLM judgment -- these need the
// "this can take several minutes" UI treatment, create_milestone doesn't
// (it's fully deterministic).
export const NONDET_METHODS = new Set(['submit_attempt']);

// Fixed criterion type options -- must match the contract's
// _VALID_CRITERION_TYPES exactly (contracts/milestonevault.py).
export const CRITERION_TYPES = [
  { value: 'star_count', label: 'Star count', targetLabel: 'Minimum stars', targetPlaceholder: 'e.g. 100' },
  { value: 'pr_merged', label: 'PR merged', targetLabel: 'PR number', targetPlaceholder: 'e.g. 42 or #42' },
  { value: 'release_tag', label: 'Release tag', targetLabel: 'Tag name', targetPlaceholder: 'e.g. v1.0.0' },
] as const;

export type CriterionType = (typeof CRITERION_TYPES)[number]['value'];
