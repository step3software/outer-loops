# RF04 — implementation evidence and verification status

**State:** [Draft PR #21](https://github.com/step3software/outer-loops/pull/21), source implementation candidate; **open, unmerged, not deployed**. The corrected candidate passes all 20 selected local Node/XML/Chrome checks; see the [correction run evidence](rf02-rf04-fix-evidence.md). GitHub CI and milestone acceptance are separate.

**Owner:** RF04 plan accepted; implementation explicitly authorized in this conversation on 2026-11-08. RF04-Q01=A, Q02=A, Q03=A. Source plan and preparation are on stacked draft PRs [#19](https://github.com/step3software/outer-loops/pull/19) and [#20](https://github.com/step3software/outer-loops/pull/20).

**Authority:** Direct owner decisions below are retained; Orcha legacy stage remains proposed without accepted host artifacts. This bounded correction changes no original A1–A8 criterion.

**Pinned original source:** `main` `1815ad7b52e9b976e92f11b845309bd9e0d80724` (merged RF03 #18). **Implementation parent:** `294e45ba54cb989ed2ea02fffe4002b54f9601ce` (prep #20).

## Preserved source contracts

| Mode | Original behavior | RF04 candidate |
| --- | --- | --- |
| 0 — normal | 1× speed, Buy Mana Z1 at original price/100 mana cost, normal combat and restart | Stable default policy |
| 1 — Mana Drought | 2× speed, Z1 cost 1, rate 30, spends `min(gold,300)`, buys `min(spent*30,totalMerchantMana)`, hides Z3/Z5 | Stable Z1 callbacks and exact shared trade; Z3/Z5 visibility-only, not a new queued-action restriction |
| 2 — Noodle Arms | Self=`max(zombie,team)/2`, team=`zombie+team` | Stable combat functions select original formulas |
| 3 — Mana Burn | `timeNeeded=4320000-totals.effectiveTime*50`; omit normal `currentLoop` and `Data.updateSnapshot` operations | Stable restart with exact same mode-specific omissions, including zero and negative budgets |

The selected mode and live merchant budget now enter forecast-only `runData.state.resources` and cache identity, rather than the Worker's default challenge mode or its former hardcoded 7,500 merchant mana. `challenges.js` loads in both browser and Worker after `saving.js`. Existing `ILSV01`, `idleLoops1`, `idleLoopsChallenge` and RF02 journal/backup keys remain unchanged.

## Criterion evidence

| Criterion | Added or retained test coverage | Current result |
| --- | --- | --- |
| A1 | RF01 original numeric characterization and new RF04 source-backed mode tests | **Passed selected checks** |
| A2 | Mode transitions and stable global/Action callback references in Node and Chrome | **Passed selected checks** |
| A3 | RF02 protected normal/challenge slot and browser import/exit/reload/resume tests | **Passed selected checks** |
| A4 | Z1 zero/12/400 gold, 0/2/7500 merchant inventory, hidden Z3/Z5 | **Passed selected checks** |
| A5 | Mode 2 zero/nonzero zombie/team and Worker-predicted combat action | **Passed selected checks** |
| A6 | Mode 3 budgets at total effective times 0/86399/86400/86401 | **Passed selected checks** |
| A7 | Explicit mode/merchant transfer and real foreground/`predictor-worker.js` parity | **Passed selected checks** |
| A8 | Regression suites and browser mode 0→1/2/3→0, reload and prestige tests | **Passed selected checks** |

## Required commands

```sh
npm run check
npm run test:model
npm run test:action
npm run test:rf01:model
npm run test:rf01:challenges
npm run test:rf02:preflight
npm run test:rf02:transaction
npm run test:rf03:model
npm run test:rf04:model
npm run test:balance
npm run check:mechanics
python scripts/check-xml.py
npm run test:browser
```

**Actual run status:** The RF04 model, full base/RF01–RF03/balance regressions, generated references, XML, complete native Chrome smoke and 12-case browser calibration passed on tested source commit 7b6b17c0855028d2c59838f08b0582f33f1e7fde. The inherited RF02 backup-recovery blocker is resolved in this candidate. npm run check also passed. The [new run record](../../.orcha/evidence/2026-11-09-rf02-rf04-fix.json) contains exact results and verified standards hashes. These are local candidate results; no green GitHub CI, accepted Orcha artifact, merge or deployment is inferred.

**Unverified risks:** authentic old player saves, a complete earned campaign, wider predictor parity, and the pre-existing R15 Gods Trial floor discrepancy. Mode 3's special reset omits normal snapshot operations under the approved preservation decision; any corrective redesign needs independent authorization.

**Rollback:** Revert RF04 source changes if verification fails or the PR is rejected. No persisted save schema/migration, production deployment, credential or saved-player data was changed. Preserve all RF02 import backup/recovery data. PR remains draft and unmerged for owner review; Orcha legacy stage acceptance is not inferred from this source branch.
