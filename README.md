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
| StudioNet | `0xA572D90194e5937caD8b0dE03A8D245784E5ADd5` | [View](https://explorer-studio.genlayer.com/address/0xA572D90194e5937caD8b0dE03A8D245784E5ADd5) |
| Bradbury | `0xa010508a7A294De55B5C89999b9d6347bd0B4688` | [View](https://explorer-bradbury.genlayer.com/address/0xa010508a7A294De55B5C89999b9d6347bd0B4688) |

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
![SubmitAttempt](https://img.shields.io/badge/submit__attempt%20fix%20v2-deployed%2C%20untested-yellow?style=flat-square)

</div>

**Honest, unrounded status:** `create_milestone` is confirmed live — a real transaction returned
`SUCCESS` with empty stderr and the correct JSON return. `submit_attempt` has been run live
twice, and both times executed cleanly end to end (fetch, LLM judgment, consensus, storage write
all completed with empty stderr) — but both times returned an incorrect `not_met` verdict on a
milestone that should have resolved `met`. The two failures were genuinely different, not a
repeat, and the model's own reasoning made each cause traceable.

**First failure:** the evidence-fetch cap (`_MAX_FETCH_LEN`) cut GitHub's raw HTML off before the
star-count region ever reached the prompt. Fixed by raising the cap and adding guessed markup
guidance to the prompt. Redeployed and re-tested.

**Second failure, on re-test:** still `not_met`. The reasoning showed the raised cap worked (more
content reached the model), but the underlying approach was wrong — GitHub's repo pages are
heavily JS-rendered, and a raw fetch doesn't reliably return the DOM a human sees in a browser,
so the guessed markup patterns weren't there to find. **The real fix:** switched the evidence
source for all three criterion types from scraping rendered HTML to calling GitHub's own REST
API (`api.github.com`) — clean JSON with named fields, confirmed against GitHub's official API
docs. This mirrors what every real-world "get a GitHub star count" implementation does.

**This second fix has been redeployed; it has not yet been re-tested.** The addresses in this
README now run attempt 2's version. A first attempt that looked plausible already failed once on
live re-test, so this deploy is treated with the same discipline, not assumed correct because the
reasoning behind it is sound — full detail, including a still-open risk the second fix doesn't
fully resolve, is in the contract's own docstring and in [`docs/deployment.md`](./docs/deployment.md),
which says the same thing this section does.

<br />

---

<div align="center">

Built on [GenLayer](https://genlayer.com) · [Portal submission](https://portal.genlayer.foundation/)

</div>
