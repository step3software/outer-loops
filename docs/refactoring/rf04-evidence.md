# RF04 — Challenge-policy verification

**Status:** Review — [draft implementation PR #21](https://github.com/step3software/outer-loops/pull/21) is unmerged; verification incomplete.
**Candidate:** `82605f4ccf12678ab485d8fdc4bad81ae7495c9a`. **Actual base:** preparation PR #20 at `294e45ba54cb989ed2ea02fffe4002b54f9601ce`; planning PR #19 is its parent. Final intended integration target is `main`, not an update performed by this task.
**Governing source:** `main` `1815ad7b52e9b976e92f11b845309bd9e0d80724`; the existing A1–A8 charter is preserved. This record evaluates the candidate, without importing its proposed plan/preparation into accepted source authority.
**Run record:** [November 9 evidence](../../.orcha/evidence/2026-11-09-rf02-rf04-verification.json).

## A1–A8 verification mapping

| Criteria | Evidence | Result |
| --- | --- | --- |
| A1/A2 | Source-backed modes 0–3, stable callback identity across 0→1/2/3→0, normal-speed restoration; Chrome stable-identity assertions | Focused cases passed |
| A3/A8 | RF02 preflight/transaction, browser legacy challenge import, isolated normal/challenge entry/exit and prestige; full browser then fails post-clear challenge-backup restoration inherited from main | Incomplete |
| A4 | Exact Mana Drought purchase/spend and merchant budgets at zero/small/cap-exceeding amounts; Z3/Z5 visibility stays distinct from already-queued eligibility | Model and selected Chrome cases passed |
| A5 | Noodle Arms self/team arithmetic compared with existing zombie/team functions; selected real Worker comparison | Focused cases passed; not every buff/guild permutation |
| A6 | Mana Burn at total effective times 0/100/86399/86400/86401; original non-positive budgets and reset omissions retained | Model and selected Chrome cases passed |
| A7 | Explicit forecast mode/current merchant budget, real production Worker snapshots and field parity; mode/budget cache identity inspected | Selected cases passed; broad predictor parity not established |

## Shared environment and remaining gates

The [RF02 verification conditions](rf02-evidence.md#verification-conditions--november-9-2026) describe the exact Windows/Node/browser adapter, and its [shared regression blockers](rf02-evidence.md#shared-regression-blockers) record the generated-reference, host-budget and recovery failures on both revisions. These remain acceptance gaps here; focused passes are not a passing complete suite.

## Authority, provenance and next gate

The [candidate's original evidence ledger](https://github.com/step3software/outer-loops/blob/82605f4ccf12678ab485d8fdc4bad81ae7495c9a/docs/refactoring/rf04-evidence.md) records its implementation claims and owner selections RF04-Q01/Q02/Q03 A. This verification adds executed evidence but grants no plan/preparation acceptance or implementation scope. Live Orcha approval remains `proposed`; all existing owner decisions and historical artifacts are retained.

Do not mark RF04 complete or merge its stack. Resolve the failing recovery/browser and regression gates under separately authorized correction scope, then rerun affected checks at a fresh candidate. Preserve RF02 backup/journal data and the unrelated R15 finding.
