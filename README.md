<div align="center">

<img src="./docs/assets/favicon.svg" width="88" alt="MilestoneVault logo" />

# MilestoneVault

### A vault that opens only when the evidence does.

<br />

![Status](https://img.shields.io/badge/status-building-yellow?style=flat-square)
![Networks](https://img.shields.io/badge/networks-StudioNet%20%2B%20Bradbury-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20GenVM-B87333?style=flat-square)

<br />

**[Documentation](./docs/architecture.md)** &nbsp;·&nbsp; **[Smart Contract](./contracts/milestonevault.py)**

</div>

<br />

---

## What this is

An escrowed grant-milestone vault. A grantor locks GEN against a milestone tied to a fixed,
independently-checkable GitHub criterion — a star count, a merged PR, a published release tag.
The vault fetches the real GitHub page itself and releases the stake only when it genuinely
matches. Neither party's description of their own progress is ever trusted.

<br />

<div align="center">

| | |
|---|---|
| **Concept** | Single-party attestation against a GitHub-verifiable criterion |
| **Consensus need** | A single grantor or recipient each has incentive to want the model sloppy in their own favor — independent re-derivation prevents one lenient or strict run from deciding a real payout alone |
| **Evidence source** | The real GitHub page for the locked repo/PR/release, fetched contract-side |
| **Networks** | StudioNet + Bradbury |

</div>

<br />

---

## How it works

1. A grantor stakes GEN and locks a repo, criterion type, and target value at creation — none of it can be reshaped later.
2. The recipient submits an attempt whenever they believe the criterion is met.
3. The contract fetches the real GitHub page itself and judges it against the locked criterion.
4. A `met` verdict releases the full stake immediately. `not_met` costs nothing but time.

<br />

<details>
<summary><b>Why single-party, not a two-party dispute</b></summary>
<br />

This is a deliberate genre and mechanism rotation, and the justification is stated honestly
rather than inflated to look identical to a claimant/respondent shape. There's no adversarial
party disputing a specific verdict here. What still justifies on-chain consensus: a single
grantor wants strict false negatives (avoid paying out); a single recipient wants lenient false
positives (get paid early) — even without a formal counter-party. Independent validator
re-derivation is what keeps either bias from deciding a real payout alone.

</details>

<br />

---

## Deployed contracts

<div align="center">

| Network | Address | Explorer |
|---|---|---|
| StudioNet | `0x750DED02407b0Fd4EE6629C0FF41b8413a9c4e37` | [View](https://explorer-studio.genlayer.com/address/0x750DED02407b0Fd4EE6629C0FF41b8413a9c4e37) |
| Bradbury | `0x9C58eB70Bf744969f2712552fF2958bfB9e5aA06` | [View](https://explorer-bradbury.genlayer.com/address/0x9C58eB70Bf744969f2712552fF2958bfB9e5aA06) |

</div>

<br />

---

## Quick start

```bash
cd frontend
npm install
npm run dev
```

No `.env` setup required — contract addresses are already wired into `src/config/chains.ts`
with the real deployed addresses as defaults. Full details: [`docs/deployment.md`](./docs/deployment.md)

<br />

---

## Project structure

```
contracts/milestonevault.py    The GenVM contract
frontend/                       React + Vite app
docs/                           architecture.md, deployment.md, contracts.md, frontend.md
LICENSE                         MIT
```

<br />

---

## Status

<div align="center">

![CreateMilestone](https://img.shields.io/badge/create__milestone-confirmed%20live-brightgreen?style=flat-square)
![SubmitAttempt](https://img.shields.io/badge/submit__attempt%20on%20current%20deploy-untested-yellow?style=flat-square)

</div>

**Honest, unrounded status:** `create_milestone` is confirmed live — a real transaction against
an earlier deployment returned `SUCCESS` with empty stderr and the correct JSON return.
`submit_attempt` was also run live against that earlier deployment and executed cleanly end to
end (fetch, LLM judgment, consensus, storage write all completed with empty stderr) — but it
returned an incorrect `not_met` verdict on a milestone that should have resolved `met`. The
model's own reasoning made the cause traceable: the evidence-fetch truncation cap
(`_MAX_FETCH_LEN`) cut GitHub's raw HTML off before the star-count region ever reached the
prompt. That's a confirmed, understood bug, not a mystery — full detail in the contract's own
docstring and in [`docs/deployment.md`](./docs/deployment.md).

The fix (a substantially larger fetch cap, confirmed against GenLayer's own
`GitHubProfilesSummaries` example, plus concrete GitHub-markup guidance added to the judging
prompt for all three criterion types) has been made and redeployed to the addresses above. **It
has not yet been re-tested live.** The addresses in this README point at the fixed contract, but
"the fix should work" and "the fix was confirmed against a real transaction" are different
claims, and only the second one changes this paragraph.

<br />

---

<div align="center">

Built on [GenLayer](https://genlayer.com) · [Portal submission](https://portal.genlayer.foundation/)

</div>
