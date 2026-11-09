# RF03 — Gameplay rules and resource verification

**Status:** Merged in [PR #18](https://github.com/step3software/outer-loops/pull/18).
Focused behavior and all selected regression suites pass on the [main correction
candidate](https://github.com/step3software/outer-loops/pull/24) and updated RF04 candidate. Preparation PR #17 remains separately
open. This does not establish complete milestone acceptance.

## A1–A8 verification mapping

| Criteria | Current executed evidence | Result |
| --- | --- | --- |
| A1/A5/A6 | DOM-less authoritative caps/defaults/snapshots; Chrome edits and rejects blank input, saves/reloads; production predictor Worker snapshots and cap-gated forecasts | Selected checks passed |
| A2/A3 | Pure Escape queries and registered predicates; first positive spend, zero spend, abort/pause, sticky continuation/reset; foreground/Worker boundary forecasts | Selected checks passed |
| A4 | 18 numeric/nine boolean resources, finite fractional/negative deltas, wrong-type/unknown/nonfinite/overflow rejection and in-place reset identity | Model checks passed |
| A7 | Full base, RF01/RF02, balance, generated, XML and Chrome suites; inherited RF02 recovery failure now passes in both correction candidates | Reported regression blockers resolved in candidates |
| A8 | Ownership remains in stats/saving/driver/actions and views; source-backed assertions retained | Selected behavior covered; no exhaustive compliance claim |

No additional RF03 gameplay redesign was needed. RF03-D05 A, RF03-D06 A,
all action/resource identities and existing save contracts remain unchanged.

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
