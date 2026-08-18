# Deployment

## Deployed contracts

**⚠️ Redeployed with the steward-review fix (reclaim_stake, deadline_ts, deterministic
GitHub-field type-checking) to a new address; not yet re-tested.** The redeploy itself is
confirmed (a real transaction exists at the address below) — whether `submit_attempt`,
`reclaim_stake`, and their interaction now work correctly end-to-end is not yet confirmed by a
live test.

This project targets StudioNet exclusively (see the project's own knowledge base, section 7) —
Bradbury deployment and dual-network wiring have been removed from this app going forward.

| Network | Address | Explorer |
|---|---|---|
| StudioNet | `0xFB6167948c51F079Ad046a2DA99b480d70eBd6d2` | [View](https://explorer-studio.genlayer.com/address/0xFB6167948c51F079Ad046a2DA99b480d70eBd6d2) |

This supersedes four earlier deployments, kept only for reference — do not use any of them:
- The version Pavel Kolosov's steward review actually looked at (StudioNet
  `0xA572D90194e5937caD8b0dE03A8D245784E5ADd5` — attempt 2's evidence-source fix, but without
  `reclaim_stake`/`deadline_ts`/the GitHub-field type-checking the review then requested), Bradbury
  `0xa010508a7A294De55B5C89999b9d6347bd0B4688`.
- Attempt 1's fix (StudioNet `0x750DED02407b0Fd4EE6629C0FF41b8413a9c4e37`, Bradbury
  `0x9C58eB70Bf744969f2712552fF2958bfB9e5aA06` — had the HTML-scraping bug described below).
- The original pre-fix deployment (StudioNet `0xC2F792A48E39122E82b082cbaE0Eb019692206cb`,
  Bradbury `0x759C60e3F8d1aAeafE6D55F820D1EAcc54aA95F2` — had the fetch-truncation bug).

## Deploy workflow

1. Write/verify the contract at `contracts/milestonevault.py`.
2. Run the full pre-deploy audit (see the project's own knowledge base — every item in the
   ten-bug nondet catalog, checked as literal greps, not eyeballed).
3. Run `genvm-lint` locally (`pip install genvm-linter`) — exit 0 required before deploying.
4. Deploy via [studio.genlayer.com/contracts](https://studio.genlayer.com/contracts) — upload
   the `.py` file directly. Never paste code inline; never deploy via a MetaMask/EVM wallet flow
   (both are rejected).
5. Copy the resulting explorer transaction link.

## Testing status — read this section before trusting anything above as "working"

**`create_milestone`: confirmed live, prior to this fix.** A real transaction against an earlier
deployment returned `Execution Result: SUCCESS`, empty stderr, and the correct JSON return
(`{"milestone_id": 1, "status": "locked"}`). This path is fully deterministic (no nondet, no LLM
call). **Not yet re-confirmed on the current fix specifically** — `create_milestone` now also
asserts `deadline_days` bounds and runs `_validate_target_for_criterion`/`_validate_repo_field`,
none of which existed when the prior confirmation was recorded. The core write logic is
unchanged and the new asserts are simple, deterministic bounds/format checks, but "unchanged
core logic" and "confirmed live on this exact version" are different claims — treat this as
understood and applied, not as confirmed, same as everything below.

**`submit_attempt`: ran cleanly twice on an earlier deployment, surfaced two rounds of a real
bug, fixed with a different approach than the first attempt.** A live call against a real repo
(158 actual GitHub stars, milestone target 100) executed with `Execution Result: SUCCESS` and
empty stderr both times — the fetch, the LLM judgment, validator consensus, and the storage
write all completed without error on both attempts. But the verdict was `not_met` both times,
which was wrong, and the two failures were genuinely different, not a repeat of the same one.

**Attempt 1's diagnosis and fix:** the returned `reasoning_summary` explained the first failure —
the fetched content was truncated GitHub HTML head boilerplate that never reached the repo header
region where the star count lives. Fixed by raising `_MAX_FETCH_LEN` (4000 → 20000) and adding
guessed GitHub-markup guidance to the charter, checked against GenLayer's own
`GitHubProfilesSummaries` example (which fetches the full page with no truncation).

**Attempt 1 was insufficient, confirmed by re-testing rather than assumed:** the same live test,
re-run against the redeployed fix, still returned `not_met`. The reasoning changed in a
diagnostic way — it now echoed the guessed markup patterns back and reported not finding them,
rather than reporting truncation. This showed the raised cap worked (more content reached the
model) but the underlying approach was wrong: GitHub's repo pages are heavily JS-rendered, and a
raw `gl.nondet.web.get()` call (no browser, no JS execution) doesn't reliably return the same DOM
a human sees in a browser. Guessed markup patterns may not exist in server-rendered HTML at all.

**Attempt 2, the fix that resolved the fetch issue:** switched the evidence source entirely, for
all three criterion types, from scraping GitHub's rendered HTML pages to calling GitHub's own
REST API (`api.github.com`) — clean, stable JSON with named fields (`stargazers_count`, `merged`,
`tag_name`/404), confirmed against GitHub's official REST API documentation. The charter was
rewritten to match: read a specific named JSON field directly, not search free text for a
pattern. This mirrors what every independent real-world "get a GitHub repo's star count"
implementation does — not a novel approach invented for this contract.

**One real data point in favor of the reasoning-content check working correctly, from attempt
2's testing:** the check requiring a `met` verdict's reasoning to contain the target value
(`_reasoning_references_target`) was an open question going in — untested against real LLM
phrasing. Across both failed attempts, it correctly didn't need to reject anything, since both
verdicts were honestly `not_met`. This doesn't retire the open question — a `met` case where the
check might be too strict on real phrasing still hasn't happened — but it's a real, if partial,
data point.

**Steward review fix (Aug 16 2026), applied but not yet live-tested at all:** Pavel Kolosov's
review requested a bounded expiry/refund path and deterministic type-checking on the GitHub
fields, neither of which the contract had at the time of review. Both are now implemented
(`reclaim_stake`, `deadline_ts` locked via `_now_epoch_seconds()`,
`_validate_target_for_criterion`, `_validate_repo_field`) and pass the project's own syntax and
nondet-catalog audits. **None of this has been exercised in Run and Debug yet.** This is
explicitly a gap, not an oversight — see "What 'confirmed live' would still require" below,
which now includes the steward's own named test cases.

**What "confirmed live" would still require:**
- A `submit_attempt` re-test against the same known-158-star repo, confirming a `met` verdict
  is now reached, `_reasoning_references_target` passes on a genuine `met` case, and the
  `emit_transfer` settlement lands (recipient balance checked before and after).
- A `submit_attempt` test against a milestone deliberately set to `not_met`, confirming the
  stake stays locked and a second attempt is genuinely possible.
- A cure/resubmission attempt after a `not_met` verdict, confirming `attempt_count` increments
  correctly and a later `submit_attempt` on the same milestone can still resolve `met`.
- **The steward's own named test cases, none yet run:** payout (a `reclaim_stake` call after a
  real deadline has passed, with the grantor's balance checked before and after, mirroring the
  existing `emit_transfer` balance-check discipline above); disagreement (a case ambiguous
  enough to trigger real leader rotation, confirming `execution_result`/`contract_state_hash`
  stay healthy through it); fetch failure (a milestone pointed at a nonexistent repo or PR,
  confirming the dead-fetch marker path still resolves `not_met` cleanly rather than erroring);
  replay (calling `reclaim_stake` a second time on an already-reclaimed milestone, confirming
  the `status == "locked"` guard actually blocks it); and recovery (confirming a `locked`
  milestone past its deadline genuinely cannot have `submit_attempt` called on it anymore, and
  that `reclaim_stake` genuinely cannot be called before the deadline).

Until those happen, treat the fix as understood and applied, not as confirmed. The README's
Status section says the same thing, deliberately, so a reviewer doesn't have to cross-reference
two documents to get an honest answer.

## Fastest way to test

GenLayer Studio's own [Run and Debug panel](https://studio.genlayer.com/run-debug) deploys a
contract directly and exposes every write/view method with an input form and full
stderr/consensus/vote detail per call — no wallet, no frontend redeploy needed. Use this first
for all contract-only iteration before touching the deployed frontend. This is exactly where
the steward's five named test cases above (payout, disagreement, fetch failure, replay,
recovery) should be run before this fix is resubmitted.

