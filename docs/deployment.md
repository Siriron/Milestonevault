# Deployment

## Deployed contracts

| Network | Address | Explorer |
|---|---|---|
| StudioNet | `0x750DED02407b0Fd4EE6629C0FF41b8413a9c4e37` | [View](https://explorer-studio.genlayer.com/address/0x750DED02407b0Fd4EE6629C0FF41b8413a9c4e37) |
| Bradbury | `0x9C58eB70Bf744969f2712552fF2958bfB9e5aA06` | [View](https://explorer-bradbury.genlayer.com/address/0x9C58eB70Bf744969f2712552fF2958bfB9e5aA06) |

These addresses supersede an earlier deployment (StudioNet
`0xC2F792A48E39122E82b082cbaE0Eb019692206cb`, Bradbury
`0x759C60e3F8d1aAeafE6D55F820D1EAcc54aA95F2`), which had the fetch-truncation bug described
below. Do not use the old addresses.

## Deploy workflow

1. Write/verify the contract at `contracts/milestonevault.py`.
2. Run the full pre-deploy audit (see the project's own knowledge base — every item in the
   seven-bug nondet catalog, checked as literal greps, not eyeballed).
3. Run `genvm-lint` locally (`pip install genvm-linter`) — exit 0 required before deploying.
4. Deploy via [studio.genlayer.com/contracts](https://studio.genlayer.com/contracts) — upload
   the `.py` file directly. Never paste code inline; never deploy via a MetaMask/EVM wallet flow
   (both are rejected).
5. Copy the resulting explorer transaction link.

## Testing status — read this section before trusting anything above as "working"

**`create_milestone`: confirmed live.** A real transaction against the earlier deployment
returned `Execution Result: SUCCESS`, empty stderr, and the correct JSON return
(`{"milestone_id": 1, "status": "locked"}`). This path is fully deterministic (no nondet, no LLM
call) and the redeploy changed nothing about it, so this remains confirmed on the current
addresses too.

**`submit_attempt`: ran cleanly, but surfaced a real bug on the earlier deployment — now fixed,
not yet re-verified.** A live call against a real repo (158 actual GitHub stars, milestone
target 100) executed with `Execution Result: SUCCESS` and empty stderr — the fetch, the LLM
judgment, validator consensus, and the storage write all completed without error. But the
verdict was `not_met`, which was wrong. The returned `reasoning_summary` explained why in the
model's own words: the fetched content was truncated GitHub HTML head boilerplate that never
reached the repo header region where the star count actually lives.

**Root cause, confirmed:** `_MAX_FETCH_LEN` was 4000 characters — enough to capture GitHub's
`<head>` metadata and stylesheet links, not enough to reach the star count further down the raw
page. This was a truncation bug, not a model or validator defect. Checked against GenLayer's own
official `GitHubProfilesSummaries` example, which fetches the complete raw page with **no**
truncation before analysis — confirming the original cap was the actual problem, not an inherent
limitation of asking an LLM to read raw HTML.

**One thing this live test did confirm working correctly:** the reasoning-content validator
check (`_reasoning_references_target`, added to require a `met` verdict's reasoning to actually
reference the locked target value) was an open question going into this test — untested against
real LLM phrasing. It performed correctly: the model's honest `not_met` reasoning didn't
reference the target value because it correctly hadn't found it, and the check didn't need to
reject anything here since the verdict was already `not_met`. This doesn't fully retire the
open question (a `met` case where the check might be too strict on real phrasing hasn't
happened yet), but it's one real data point in favor of the check behaving as designed.

**Fix applied, redeployed, not yet re-tested:** `_MAX_FETCH_LEN` raised to 20000, and the
judging charter given concrete GitHub-markup guidance (specific id/class/attribute patterns to
search for, per criterion type, plus explicit warnings against matching an incidental unrelated
occurrence of the same keyword elsewhere on the page — a risk identified while writing the fix,
not from a live failure). Full detail in the contract's own docstring.

**What "confirmed live" on the current deploy would still require:**
- A `submit_attempt` re-test against the same known-158-star repo, confirming a `met` verdict
  is now reached, `_reasoning_references_target` passes on a genuine `met` case, and the
  `emit_transfer` settlement lands (recipient balance checked before and after).
- A `submit_attempt` test against a milestone deliberately set to `not_met`, confirming the
  stake stays locked and a second attempt is genuinely possible.
- A cure/resubmission attempt after a `not_met` verdict, confirming `attempt_count` increments
  correctly and a later `submit_attempt` on the same milestone can still resolve `met`.

Until those happen, treat the fix as understood and applied, not as confirmed. The README's
Status section says the same thing, deliberately, so a reviewer doesn't have to cross-reference
two documents to get an honest answer.

## Fastest way to test

GenLayer Studio's own [Run and Debug panel](https://studio.genlayer.com/run-debug) deploys a
contract directly and exposes every write/view method with an input form and full
stderr/consensus/vote detail per call — no wallet, no frontend redeploy needed. Use this first
for all contract-only iteration before touching the deployed frontend.

