# RF03 — Gameplay rules and resource verification

**Status:** Merged in [PR #18](https://github.com/step3software/outer-loops/pull/18).
Focused behavior and regressions passed before [correction #24](https://github.com/step3software/outer-loops/pull/24)
merged into main. All 18 baseline checks pass on updated #23; the additional
calibration command fails Windows cleanup after 12 matched comparisons. RF04
retains its earlier 20-check result, and preparation #17 remains open. Milestone
acceptance remains separate.

## A1–A8 verification mapping

| Criteria | Current executed evidence | Result |
| --- | --- | --- |
| A1/A5/A6 | DOM-less authoritative caps/defaults/snapshots; Chrome edits and rejects blank input, saves/reloads; production predictor Worker snapshots and cap-gated forecasts | Selected checks passed |
| A2/A3 | Pure Escape queries and registered predicates; first positive spend, zero spend, abort/pause, sticky continuation/reset; foreground/Worker boundary forecasts | Selected checks passed |
| A4 | 18 numeric/nine boolean resources, finite fractional/negative deltas, wrong-type/unknown/nonfinite/overflow rejection and in-place reset identity | Model checks passed |
| A7 | Full base, RF01/RF02, balance, generated, XML and Chrome suites; inherited RF02 recovery failure now passes in both correction candidates | Reported regression blockers resolved on main and updated #23 |
| A8 | Ownership remains in stats/saving/driver/actions and views; source-backed assertions retained | Selected behavior covered; no exhaustive compliance claim |

No additional RF03 gameplay redesign was needed. RF03-D05 A, RF03-D06 A,
all action/resource identities and existing save contracts remain unchanged.

## Provenance and authority

The earlier [failure record](../../.orcha/evidence/2026-11-09-rf02-rf04-verification.json)
and [correction run](../../.orcha/evidence/2026-11-09-rf02-rf04-fix.json) remain
unchanged historical evidence. The [current review/merge/rerun record](../../.orcha/evidence/2026-11-09-pr24-merge-pr23-verification.json)
records a clean bounded review of all 27 PR #24 paths and 19 fresh passing checks,
its owner-authorized merge into `main` at `baaa427ebd49e5fa05336a8498796799950453d3`, and 18 passing baseline checks
on PR #23's combined candidate `19169372b46d5ed0bf543253052ddb277d756b55`. The additional calibration
command matched all 12 cases but failed during Windows profile cleanup, including
on retry. The timing/recovery blockers are resolved; the full 19-command run is
not green because that teardown failure remains.

All original A1–A8 and owner decisions remain. Orcha's legacy stages and accepted
artifacts are unchanged; verification and a code merge do not complete milestones
or establish deployment. Authentic saves, exhaustive predictor/buff permutations,
earned campaign endpoints and official RW00 baselines remain unverified; R15 is
preserved. RF04 #21 remains a separate unmerged candidate on its existing stack.
