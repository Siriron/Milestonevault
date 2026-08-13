# Deployment

## Deployed contracts

**⚠️ Redeployed with attempt 2's fix; not yet re-tested.** The addresses below run the GitHub
REST API evidence source (see Testing status below). The redeploy itself is confirmed (passed
lint, passed schema load) — whether `submit_attempt` now resolves correctly is not yet confirmed
by a live test.

| Network | Address | Explorer |
|---|---|---|
| StudioNet | `0xA572D90194e5937caD8b0dE03A8D245784E5ADd5` | [View](https://explorer-studio.genlayer.com/address/0xA572D90194e5937caD8b0dE03A8D245784E5ADd5) |
| Bradbury | `0xa010508a7A294De55B5C89999b9d6347bd0B4688` | [View](https://explorer-bradbury.genlayer.com/address/0xa010508a7A294De55B5C89999b9d6347bd0B4688) |

This supersedes two earlier deployments: attempt 1's fix (StudioNet
`0x750DED02407b0Fd4EE6629C0FF41b8413a9c4e37`, Bradbury `0x9C58eB70Bf744969f2712552fF2958bfB9e5aA06`
— had the HTML-scraping bug described below), and the original pre-fix deployment (StudioNet
`0xC2F792A48E39122E82b082cbaE0Eb019692206cb`, Bradbury `0x759C60e3F8d1aAeafE6D55F820D1EAcc54aA95F2`
— had the fetch-truncation bug). Do not use either older set of addresses.

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

**`submit_attempt`: ran cleanly twice, but surfaced two rounds of a real bug — now fixed with a
different approach than the first attempt, not yet re-verified.** A live call against a real repo
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

**Attempt 2, the actual fix:** switched the evidence source entirely, for all three criterion
types, from scraping GitHub's rendered HTML pages to calling GitHub's own REST API
(`api.github.com`) — clean, stable JSON with named fields (`stargazers_count`, `merged`,
`tag_name`/404), confirmed against GitHub's official REST API documentation. The charter was
rewritten to match: read a specific named JSON field directly, not search free text for a
pattern. This mirrors what every independent real-world "get a GitHub repo's star count"
implementation does — not a novel approach invented for this contract.

**One thing worth naming plainly:** attempt 1 looked plausible and still failed on live re-test.
Attempt 2 is reasoned from stronger ground (a stable, documented API rather than guessed markup),
but "reasoned from stronger ground" and "confirmed against a real transaction" are still
different claims, and only the second one should change this paragraph's confidence.

**One real data point in favor of the reasoning-content check working correctly:** the check
requiring a `met` verdict's reasoning to contain the target value (`_reasoning_references_target`)
was an open question going in — untested against real LLM phrasing. Across both failed attempts,
it correctly didn't need to reject anything, since both verdicts were honestly `not_met`. This
doesn't retire the open question — a `met` case where the check might be too strict on real
phrasing still hasn't happened — but it's a real, if partial, data point.

**What "confirmed live" would still require:**
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

