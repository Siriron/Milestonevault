# Deployment

## Deployed contracts

| Network | Address | Explorer |
|---|---|---|
| StudioNet | `0xC2F792A48E39122E82b082cbaE0Eb019692206cb` | [View](https://explorer-studio.genlayer.com/address/0xC2F792A48E39122E82b082cbaE0Eb019692206cb) |
| Bradbury | `0x759C60e3F8d1aAeafE6D55F820D1EAcc54aA95F2` | [View](https://explorer-bradbury.genlayer.com/address/0x759C60e3F8d1aAeafE6D55F820D1EAcc54aA95F2) |

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

**Honest, unrounded status: the contract has deployed cleanly to both networks — meaning it
passed lint and schema load — but `create_milestone` and `submit_attempt` have not yet been
exercised against either deployed address.** No transaction has been sent, no stderr has been
read, no verdict has been produced. Deployment success confirms the contract loads; it does not
confirm any write path executes correctly. This project's own history has repeatedly shown that
bugs in a settlement or nondet path stay completely invisible until a write method actually
reaches that code — deployment alone would not have caught any of them.

**What "confirmed live" would require, not yet done:**
- A `create_milestone` call, with stderr and the returned JSON read directly, not paraphrased.
- A `submit_attempt` call against a real repo with a known star count / PR status / tag,
  producing a `met` verdict — confirming the fetch, the judgment, and the `emit_transfer`
  settlement all work end to end, with the recipient's balance checked before and after.
- A second `submit_attempt` against a milestone deliberately set to `not_met`, confirming the
  stake stays locked and a second attempt is genuinely possible.
- Specific scrutiny on the reasoning-content validator check (`_reasoning_references_target`):
  this was added without having been tested against real LLM phrasing, and could in principle be
  too strict (rejecting a correct leader answer phrased differently than expected) or too loose.

Until those four things happen, treat every claim in this repository about "how it works" as
theoretically correct, not confirmed correct. The README's Status section says the same thing,
deliberately, so a reviewer doesn't have to cross-reference two documents to get an honest
answer.

## Fastest way to test

GenLayer Studio's own [Run and Debug panel](https://studio.genlayer.com/run-debug) deploys a
contract directly and exposes every write/view method with an input form and full
stderr/consensus/vote detail per call — no wallet, no frontend redeploy needed. Use this first
for all contract-only iteration before touching the deployed frontend.
