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
  status: 'locked' | 'released';
  last_verdict: string;
  last_reasoning: string;
  attempt_count: number;
}

export interface CreateMilestoneArgs {
  recipient: string;
  repoOwner: string;
  repoName: string;
  criterionType: CriterionType;
  targetValue: string;
  description: string;
  stakeValue: bigint; // wei-denominated GEN amount
}

// create_milestone(self, recipient, repo_owner, repo_name, criterion_type,
// target_value, description) -> str
// @gl.public.write.payable -- value must be > 0 (asserted contract-side).
export function buildCreateMilestoneArgs(a: CreateMilestoneArgs): any[] {
  return [a.recipient, a.repoOwner, a.repoName, a.criterionType, a.targetValue, a.description];
}

// submit_attempt(self, milestone_id: u256) -> str
export function buildSubmitAttemptArgs(milestoneId: number): any[] {
  return [milestoneId];
}

// get_milestone(self, milestone_id: u256) -> str (JSON)
export function buildGetMilestoneArgs(milestoneId: number): any[] {
  return [milestoneId];
}
