# Architecture

## Concept

MilestoneVault is single-party attestation, not a two-party dispute. A grantor locks GEN
against a milestone tied to a fixed, independently-checkable GitHub criterion. A recipient
submits an attempt whenever they believe the criterion is met. There is no respondent, no
counter-stake, no rebuttal.

## Consensus need — stated honestly

This is a narrower justification than Copyleft's or Recourse's claimant/respondent shapes, and
it's stated plainly rather than dressed up as identical. There's no adversarial party disputing
a specific verdict. What still justifies on-chain, multi-validator consensus here: a single
grantor has an incentive to want the model to be strict (false negatives avoid paying out); a
single recipient has an incentive to want it lenient (false positives get paid early) — even
without a formal counter-party contesting any individual call. Independent re-derivation by
multiple validators is what keeps a single lenient or strict validator run from deciding a real
payout alone.

## Evidence model

The evidence source is never chosen per-call by either party. It's a GitHub URL built
deterministically from the milestone's own locked `repo_owner`/`repo_name`/`target_value`
fields at creation time — the recipient cannot redirect the fetch to a friendlier page. The
contract fetches that real page itself inside the same nondet block that produces the verdict,
and judges the fetched content against the locked criterion, never against either party's
description of it.

This is the specific fix for the failure pattern that got a related concept (SourceChecker)
rejected on the portal: a caller-selected page only proves the page repeats a claim, not that
the claim is true. Here, neither the source nor the criterion is caller-selected at attempt
time — both were locked structurally at creation, before either party had information about how
a check might resolve.

## Verdict shape

Binary — `met` / `not_met`, deliberately not three-way. A three-way verdict exists elsewhere in
this project's contracts specifically to protect a real stake from being unfairly slashed on
ambiguous evidence. There's no slashing here: a `not_met` verdict costs the recipient nothing
but time, and they can simply attempt again once the criterion is genuinely true. Adding a third
state would add complexity with no corresponding safety benefit for this specific design.

## Content validation

`submit_attempt`'s validator requires a `met` verdict's reasoning to actually reference the
locked `target_value` it claims to have confirmed — a real content check, not just a length
threshold. This is gated on `met` only: a `not_met` verdict can legitimately explain itself
without repeating the target value (e.g. a dead-fetch marker), and penalizing that would punish
honest negative verdicts rather than catch weak ones.

## Bounded expiry (added Aug 16 2026, per steward review)

Every milestone locks a `deadline_days` value (1–3650) at `create_milestone`, converted to an
absolute `deadline_ts` from the contract's own on-chain clock at that moment — never a value
either party can set after the fact, and never re-derived from the client's local clock.
`submit_attempt` is blocked once the deadline passes; `reclaim_stake` becomes callable by the
grantor only, only once the deadline has passed, only while the milestone is still `locked`.
This closes the two ways a stake could otherwise lock forever: a criterion the recipient never
meets, and a recipient who is simply unreachable (wrong address, lost key, or one who never
acts) — the deadline recovers the grantor's funds either way, with no dependency on the
recipient doing anything.

The deadline is locked at creation and cannot be extended by either party afterward — the same
locked-before-outcome-is-known discipline this contract already applies to `repo_owner`,
`repo_name`, and `target_value`. A grantor who wants to give a stalled recipient more time has
no way to do so within this contract; that's a deliberate trade-off in favor of keeping the
lock genuinely immutable, not an oversight.

## Deliberate gaps

- `target_value`/`repo_owner`/`repo_name` type-checking is format-only (numeric for
  `star_count`/`pr_merged`, GitHub-legal characters for `release_tag`/repo fields) — it cannot
  and does not confirm the target actually exists on GitHub before creation, since that would
  require a fetch outside the nondet block at creation time, which this contract doesn't do. A
  syntactically valid but nonexistent PR number or tag still creates successfully and resolves
  `not_met` on every attempt until the deadline passes, at which point `reclaim_stake` is the
  recovery path for that case too.
- Only three criterion types (star count, PR merge status, release tag existence). Arbitrary
  free-text criteria are explicitly out of scope — that would reintroduce an unverifiable,
  party-described claim.
