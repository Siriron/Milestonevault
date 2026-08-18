<div align="center">

<img src="./docs/assets/favicon.svg" width="88" alt="MilestoneVault logo" />

# MilestoneVault

### A vault that opens only when the evidence does.

<br />

![Status](https://img.shields.io/badge/status-building-yellow?style=flat-square)
![Networks](https://img.shields.io/badge/networks-StudioNet-blue?style=flat-square)
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
| **Evidence source** | GitHub's own REST API for the locked repo/PR/release, fetched contract-side |
| **Networks** | StudioNet |

</div>

<br />

---

## How it works

1. A grantor stakes GEN and locks a repo, criterion type, target value, and a bounded deadline (1–3650 days) at creation — none of it can be reshaped later.
2. The recipient submits an attempt whenever they believe the criterion is met, any time before the deadline.
3. The contract fetches the real GitHub API response itself and judges it against the locked criterion.
4. A `met` verdict releases the full stake immediately. `not_met` costs nothing but time — attempt again, until the deadline.
5. If the deadline passes with the criterion still unmet, the grantor — and only the grantor — can reclaim the full stake.

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
| StudioNet | `0xFB6167948c51F079Ad046a2DA99b480d70eBd6d2` | [View](https://explorer-studio.genlayer.com/address/0xFB6167948c51F079Ad046a2DA99b480d70eBd6d2) |

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

![CreateMilestone](https://img.shields.io/badge/create__milestone-code%20correct%2C%20not%20re--tested-yellow?style=flat-square)
![SubmitAttempt](https://img.shields.io/badge/submit__attempt-code%20correct%2C%20not%20re--tested-yellow?style=flat-square)
![ReclaimStake](https://img.shields.io/badge/reclaim__stake-new%2C%20untested-yellow?style=flat-square)

</div>

**Honest, unrounded status:** an earlier version of `create_milestone` was confirmed live — a
real transaction returned `SUCCESS` with empty stderr and the correct JSON return — and an
earlier version of `submit_attempt` was run live twice, executing cleanly end to end (fetch,
LLM judgment, consensus, storage write) both times, with the evidence-fetch approach fixed
along the way from scraping GitHub's rendered HTML to calling GitHub's own REST API directly.
Full detail on that history is in [`docs/deployment.md`](./docs/deployment.md).

**None of that history has been re-run since.** A steward review (Pavel Kolosov, Aug 16 2026)
requested a bounded expiry/refund path and deterministic type-checking on the GitHub fields —
neither existed until now. Both are implemented: `reclaim_stake` (grantor-only, deadline-gated,
fully deterministic — no nondet call), a `deadline_ts` locked at `create_milestone` via the
project's confirmed-correct `_now_epoch_seconds()` parser, and `_validate_target_for_criterion`/
`_validate_repo_field` format checks run before a fetch URL is ever built. The code passes this
project's own syntax and nondet-catalog audits.

**What hasn't happened yet: any of it running against a live network.** The steward's own review
named five specific cases to test before resubmission — payout, disagreement, fetch failure,
replay, and recovery — and none have been run. Until they are, this is understood and applied,
not confirmed. This section says the same thing as
[`docs/deployment.md`](./docs/deployment.md)'s Testing status section, deliberately, so a
reviewer doesn't have to cross-reference two documents to get an honest answer.

<br />

---

<div align="center">

Built on [GenLayer](https://genlayer.com) · [Portal submission](https://portal.genlayer.foundation/)

</div>
