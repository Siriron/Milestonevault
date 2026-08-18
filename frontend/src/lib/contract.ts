import type { CriterionType } from '../config/chains';

// Typed wrappers over the raw readContract/writeContract calls from
// useGenLayer, matching contracts/milestonevault.py's method signatures
// exactly (argument names and order). Keeping this in one place means a
// future contract redeploy with a changed signature only needs updating
// here, not at every call site.

export interface Milestone {
  milestone_id: number;
  grantor: string;
  recipient: string;
  repo_owner: string;
  repo_name: string;
  criterion_type: CriterionType;
  target_value: string;
  description: string;
  stake_amount: number;
  status: 'locked' | 'released' | 'reclaimed';
  last_verdict: string;
  last_reasoning: string;
  attempt_count: number;
  deadline_ts: number; // epoch seconds, locked at creation, never reshaped
}

export interface CreateMilestoneArgs {
  recipient: string;
  repoOwner: string;
  repoName: string;
  criterionType: CriterionType;
  targetValue: string;
  description: string;
  stakeValue: bigint; // wei-denominated GEN amount
  deadlineDays: number; // 1-3650, contract-side asserted
}

// create_milestone(self, recipient, repo_owner, repo_name, criterion_type,
// target_value, description, deadline_days) -> str
// @gl.public.write.payable -- value must be > 0 (asserted contract-side).
// deadline_days: contract-side asserted 1-3650 inclusive. Passed as a plain
// number here (u256 args accept a JS number/bigint from genlayer-js), never
// pre-converted to a timestamp client-side -- the contract derives the
// absolute deadline_ts itself from its own on-chain clock at creation, so
// the client's local clock is never a trust input.
export function buildCreateMilestoneArgs(a: CreateMilestoneArgs): any[] {
  return [
    a.recipient,
    a.repoOwner,
    a.repoName,
    a.criterionType,
    a.targetValue,
    a.description,
    a.deadlineDays,
  ];
}

// submit_attempt(self, milestone_id: u256) -> str
// Contract-side now also asserts now_ts < deadline_ts -- a submit call
// after the deadline reverts with "deadline has passed; this milestone is
// now reclaim-only" rather than silently attempting a doomed nondet round.
export function buildSubmitAttemptArgs(milestoneId: number): any[] {
  return [milestoneId];
}

// reclaim_stake(self, milestone_id: u256) -> str
// Grantor-only, deterministic (no nondet round, no LLM call, no "this can
// take several minutes" wait needed on this specific write -- see
// VaultDetailPage's pending-state handling for how this differs from
// submit_attempt's UI).
export function buildReclaimStakeArgs(milestoneId: number): any[] {
  return [milestoneId];
}

// get_milestone(self, milestone_id: u256) -> str (JSON)
export function buildGetMilestoneArgs(milestoneId: number): any[] {
  return [milestoneId];
}
