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
| StudioNet | `0xC2F792A48E39122E82b082cbaE0Eb019692206cb` | [View](https://explorer-studio.genlayer.com/address/0xC2F792A48E39122E82b082cbaE0Eb019692206cb) |
| Bradbury | `0x759C60e3F8d1aAeafE6D55F820D1EAcc54aA95F2` | [View](https://explorer-bradbury.genlayer.com/address/0x759C60e3F8d1aAeafE6D55F820D1EAcc54aA95F2) |

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

![Deployed](https://img.shields.io/badge/deploys%20cleanly%2C%20both%20networks-confirmed-brightgreen?style=flat-square)
![Writes](https://img.shields.io/badge/create__milestone%20%2F%20submit__attempt-untested-yellow?style=flat-square)

</div>

**Honest, unrounded status:** the contract deploys cleanly to both networks — meaning it passed
lint and schema load — but no write method has been exercised against either deployed address
yet. No `create_milestone` or `submit_attempt` transaction has been sent, no stderr has been
read, no verdict has been produced. Deployment success confirms the contract loads; it does not
confirm any write path executes correctly, and this project's own history has repeatedly shown
that settlement and nondet bugs stay invisible until a write method actually reaches that code.
The frontend is built and wired to call both methods correctly against the deployed addresses,
but "the app doesn't crash" and "the contract genuinely does the right thing when called" are
different, unconfirmed claims. See [`docs/deployment.md`](./docs/deployment.md) for exactly what
a live test would need to check before this line changes.

<br />

---

<div align="center">

Built on [GenLayer](https://genlayer.com) · [Portal submission](https://portal.genlayer.foundation/)

</div>
