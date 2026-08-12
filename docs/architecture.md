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

## Deliberate gaps

- No deadline or grantor-reclaim path. A stake can sit locked indefinitely if a recipient never
  completes the criterion. Out of scope for this version.
- Only three criterion types (star count, PR merge status, release tag existence). Arbitrary
  free-text criteria are explicitly out of scope — that would reintroduce an unverifiable,
  party-described claim.
