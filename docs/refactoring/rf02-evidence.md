# RF02 — Persistence safety verification

**Status:** Merged in [PR #16](https://github.com/step3software/outer-loops/pull/16).
The backup recovery correction [PR #24](https://github.com/step3software/outer-loops/pull/24)
passed review and 19 fresh local checks, then merged into main at `baaa427ebd49e5fa05336a8498796799950453d3`.
All 18 baseline checks pass on updated #23. The additional calibration command
passed its 12 comparisons but failed Windows profile cleanup. RF04 remains an
unmerged candidate; complete milestone acceptance is separate.

## Recovery regression and result

After challenge/prestige transitions and explicit clear, restoration rejected a
valid backup because `getImportContract()` inferred types from live options after
localStorage had made `updateRate` a string. The new regression failed before
repair with `string !== number`. Canonical option categories now define the
contract; recognized numeric-text update rates normalize only in a clone.
Malformed values remain rejected and the original backup bytes are preserved.

The full repository browser suite now passes independent challenge restoration,
then active normal restoration, after clearing both slots. Both saves and
`prestigeBackup` match their pre-clear bytes and the transaction journal is clear.
Preflight, byte-exact transaction/quota rollback, legacy imports, challenges,
prestige, RF01/RF03 and real Worker assertions also pass on both candidates.

## A1–A8 verification mapping

| Criteria | Current evidence and disposition |
| --- | --- |
| A1/A2/A3 | Pure preflight, malformed-input, known legacy/current imports, idempotent option migration and transaction fault injection pass; authentic player-save coverage remains unverified. |
| A4 | Current/legacy synthetic roundtrips and complete selected browser lifecycle now pass, including recovery of both slots. |
| A5 | Exact-byte backup restore, bidirectional rotation, quota/apply/interruption rollback and post-clear independent recovery pass. The reported recovery blocker is resolved on main and the checked documentation candidate. |
| A6 | Pure validator and actual shipping transaction code are tested without a live view; browser integrations pass. |
| A7 | All selected RF01–RF03, balance, generated-reference, XML and full Chrome suites pass; RF04's additional model and browser assertions pass on its candidate. Broad unmodeled permutations remain unverified. |
| A8 | [ADR 001](../decisions/ADR-001-recoverable-save-import.md), RF02-D01/D02/D03 and the [P01–P22 matrix](rf02-test-matrix.md) remain unchanged. Synthetic tests do not certify every historical shape or representative real-save size. |

## Shared verification corrections

The profiler preserves original errors and post-budget diagnostics; the engine
owns its execution ceiling and the parent watchdog still caps startup/time/RSS.
Windows RSS sampling and browser discovery use native supported paths. Profile
paths resolve short aliases before Chrome creates files. The line-ending fixture
processes each physical source once, including RF04's repeated registry entry.
Potion accounting/event fixtures now actually establish their synthetic premises.
Full equivalence scenarios completed unchanged with a longer external deadline.
Generated formulas and timing estimates remain unchanged; provenance is current.

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
