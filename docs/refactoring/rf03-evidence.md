# RF03 — Gameplay rules and resource verification

**Status:** RF03 #18 and shared correction #24 are merged. All 20 selected checks
pass on the #23 cleanup correction, including the full balance and browser/Worker
regressions. No RF03 gameplay redesign was needed. Preparation #17 remains
separately open; milestone acceptance is unchanged.

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
