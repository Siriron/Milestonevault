# Smart contract reference

`contracts/milestonevault.py`

## Methods

| Method | Type | Description |
|---|---|---|
| `create_milestone(recipient, repo_owner, repo_name, criterion_type, target_value, description)` | write, payable | Locks a new milestone; stakes the attached GEN value. `value` must be > 0. |
| `submit_attempt(milestone_id)` | write | Fetches the real GitHub evidence and judges it against the locked criterion. Releases the full stake on `met`. Callable only by the milestone's recipient. |
| `get_milestone(milestone_id)` | view | Returns the full milestone record as JSON. |
| `get_next_id()` | view | Returns the next milestone ID to be assigned. |

## Criterion types

| Value | Target field means | Evidence fetched |
|---|---|---|
| `star_count` | Minimum star count | The repo's own page |
| `pr_merged` | A PR number | That exact pull request's page |
| `release_tag` | A tag name | That release's page |

## Storage model

Single flat record type (`Milestone`), no nested arrays — Bug 7 (DynArray-on-nested-dataclass)
does not apply to this contract.

## Nondet pattern

`submit_attempt` follows the project's confirmed seven-item nondet catalog without exception:
positional `run_nondet_unsafe` call, `leaders_res.calldata` access with `isinstance` check
first, `emit_transfer` (never `.send()`) for the settlement transfer, `copy_to_memory` before
entering the nondet block, nested `leader_fn`/`validator_fn` with zero `self.` references, no
`float()` anywhere reachable from nondet code, and a pinned pragma hash.

## Content validation

`validator_fn` requires a `met` verdict's `reasoning_summary` to contain the locked
`target_value` (case/whitespace/punctuation-normalized substring match), not just a
length threshold — real criteria-based validation, gated only on `met` so honest `not_met`
explanations aren't penalized for not repeating a value they're correctly reporting as absent.
