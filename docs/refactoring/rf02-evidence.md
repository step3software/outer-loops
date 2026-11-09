# RF02 — Persistence safety verification

**Status:** Merged in [PR #16](https://github.com/step3software/outer-loops/pull/16).
The backup recovery defect is corrected and verified in [draft correction PR #24](https://github.com/step3software/outer-loops/pull/24)
at `8522b4564ae5d5abc034acaa6e728a79a8cb54fe`, and in the updated RF04 candidate. The correction is unmerged;
this is passing candidate evidence, not complete milestone acceptance.

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
| A5 | Exact-byte backup restore, bidirectional rotation, quota/apply/interruption rollback and post-clear independent recovery pass. The reported recovery blocker is resolved in the candidates. |
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

The [earlier failure record](../../.orcha/evidence/2026-11-09-rf02-rf04-verification.json)
and its original source pins remain unchanged. The [correction evidence](rf02-rf04-fix-evidence.md)
and [new machine-readable record](../../.orcha/evidence/2026-11-09-rf02-rf04-fix.json)
record 19 passing checks on the main correction and 20 on RF04, including all
full equivalence scenarios, native Chrome smoke/Worker and browser calibration.
Current `main` is still `1815ad7b52e9b976e92f11b845309bd9e0d80724`; passing unmerged candidates do not repair that
branch until owner-controlled integration.

All original A1–A8 criteria and owner decisions are retained. Orcha's legacy
approval stage remains `proposed`; no accepted artifacts, milestone completion,
merge or deployment are created. Authentic historical saves, exhaustive predictor
permutations, earned campaign endpoints and official RW00 baselines remain
unverified. The known R15 Gods Trial discrepancy remains outside this correction.
