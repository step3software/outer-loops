# RF02 — Persistence safety verification

**Status:** RF02 #16 and recovery correction #24 are merged. PR #23 delivers the
Windows cleanup correction; all 20 selected checks pass, including byte-exact
recovery, real Chrome/Worker and calibration teardown. Complete milestone
acceptance remains separate; see current verification below.

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

## Current verification and authority

[Windows cleanup fix and full rerun](../../.orcha/evidence/2026-11-09-windows-cleanup-verification.json) records **all 20 checks
passing** at `68e012611ba425045c1db9a881c86b10120846f0` with ordinary system temporary storage and no host cleanup
assistance. The formerly failing calibration now exits 0 after all 12 comparisons
and strict teardown. Original failure and correction records remain unchanged
historical evidence; their old failed outcomes are not rewritten.

The original RF02/RF03 implementations and correction #24 are merged. PR #23
delivers the cleanup correction and these records; its provider page records the
merge outcome under the owner's explicit conditional authorization. Original
A1–A8, owner decisions and Orcha legacy stages are unchanged. Verification does
not complete a milestone or establish deployment. RF04 #21 and its stack remain
unchanged with their prior candidate evidence; this rerun does not reverify RF04.
