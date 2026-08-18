# Smart contract reference

`contracts/milestonevault.py`

## Methods

| Method | Type | Description |
|---|---|---|
| `create_milestone(recipient, repo_owner, repo_name, criterion_type, target_value, description, deadline_days)` | write, payable | Locks a new milestone, a bounded deadline (1–3650 days), and stakes the attached GEN value. `value` must be > 0. `repo_owner`/`repo_name` are deterministically format-checked (GitHub-legal characters); `target_value` is deterministically type-checked against what `criterion_type` needs (numeric for `star_count`/`pr_merged`, ref-legal for `release_tag`) — added per steward review, see the note below. |
| `submit_attempt(milestone_id)` | write | Fetches the real GitHub evidence and judges it against the locked criterion. Releases the full stake on `met`. Callable only by the milestone's recipient, and only before `deadline_ts`. |
| `reclaim_stake(milestone_id)` | write | Fully deterministic, no nondet call. Returns the full stake to the grantor once `deadline_ts` has passed with the milestone still `locked`. Callable only by the original grantor. Added per steward review, see the note below. |
| `get_milestone(milestone_id)` | view | Returns the full milestone record as JSON, including `deadline_ts`. |
| `get_next_id()` | view | Returns the next milestone ID to be assigned. |

## Steward review fix (Aug 16 2026)

Pavel Kolosov's review requested two things: a bounded expiry/refund path so an unmet
criterion or an unreachable recipient can't lock funds forever, and deterministic
parsing/type-checking on the GitHub fields. Both are now in the contract:

- **`reclaim_stake`** — `deadline_days` (1–3650) is locked at `create_milestone`, converted to
  an absolute `deadline_ts` via `_now_epoch_seconds()` (the project's confirmed-correct
  ISO-8601 parser for `gl.message_raw["datetime"]`). `submit_attempt` is blocked once the
  deadline passes; `reclaim_stake` is grantor-only, deadline-gated, and transfers the full
  stake back via `emit_transfer`. The deadline itself is locked at creation and can never be
  extended by either party afterward — the same locked-before-outcome-is-known discipline this
  project applies to every other field a verdict depends on.
- **`_validate_target_for_criterion`** / **`_validate_repo_field`** — deterministic, plain-Python
  format checks run at `create_milestone`, before `target_value`/`repo_owner`/`repo_name` are
  ever used to build a fetch URL. A non-numeric `pr_merged` target, for example, is now rejected
  at creation with a clear assertion message, rather than silently building a malformed API URL
  that only surfaced later as a generic fetch-failure marker on `submit_attempt`.

**Not yet live-verified** — code-correct, syntax-checked, and audited against the project's full
nondet catalog, but the redeployed contract still needs a real Studio test pass (payout,
disagreement, fetch failure, replay, and recovery cases, per the steward's own note) before this
can be marked confirmed rather than theoretically correct.

## Criterion types

| Value | Target field means | Evidence fetched |
|---|---|---|
| `star_count` | Minimum star count | The repo's own page |
| `pr_merged` | A PR number | That exact pull request's page |
| `release_tag` | A tag name | That release's page |

## Storage model

Single flat record type (`Milestone`), no nested arrays — Bug 7 (DynArray-on-nested-dataclass)
does not apply to this contract. `Milestone` now also carries `deadline_ts: u256`, locked at
creation and never reshaped afterward.

## Nondet pattern

`submit_attempt` follows the project's confirmed ten-item nondet catalog without exception:
positional `run_nondet_unsafe` call, `leaders_res.calldata` access with `isinstance` check
first, `emit_transfer` (never `.send()`) for the settlement transfer, `copy_to_memory` before
entering the nondet block, nested `leader_fn`/`validator_fn` with zero `self.` references, no
`float()` anywhere reachable from nondet code, a pinned pragma hash, and correct
`gl.message_raw["datetime"]` parsing via `_now_epoch_seconds()`. Bugs 9 (GitHub HTML-vs-diff)
and 10 (Address-keyed TreeMap normalization) don't apply to this contract — it never fetches a
commit URL, and `milestones` is keyed by `u256`, never by an Address-derived string.
`reclaim_stake` is fully deterministic — no nondet block at all.

## Content validation

`validator_fn` requires a `met` verdict's `reasoning_summary` to contain the locked
`target_value` (case/whitespace/punctuation-normalized substring match), not just a
length threshold — real criteria-based validation, gated only on `met` so honest `not_met`
explanations aren't penalized for not repeating a value they're correctly reporting as absent.
