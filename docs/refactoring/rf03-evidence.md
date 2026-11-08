# RF03 — implementation evidence (unmerged candidate)

**State:** Implementation on an isolated review branch; not merged, released, accepted or deployed.  
**Base:** `main` commit `0f64bb2eddc88f5327ae53c3a5420ef0e4398807` (RF02 merged).  
**Owner decisions:** RF03-D05 A — strict typed resources, no legacy sentinel exceptions; RF03-D06 A — Escape becomes sticky only after its first positive mana-spending step below 60 effective seconds.  
**Prerequisite:** [RF02 PR #16](https://github.com/step3software/outer-loops/pull/16) merged on 2026-11-08; [RF03 preparation PR #17](https://github.com/step3software/outer-loops/pull/17) remains separately unmerged. Orcha's legacy workflow stage still needs reconciliation; direct implementation authorization in the conversation does not update that stage.

## Applied implementation

- `stats.js`: `getBuffCap` reads model state, and `setBuffCap` validates integer caps at 0 through the existing hard cap.
- `saving.js`: register `buffCaps` with `Data.registerAll`; restore caps without DOM dependency, preserving `buffCaps` save key and legacy numeric `parseInt` interpretation.
- `views/main.view.js` and `views/buffs.view.js`: validated single-input edits, invalid edit rollback, and state-projected values.
- `actionList.js`: pure `Escape.canStart` and guarded formerly direct writes (Wizard College, reputation, heart).
- `actions.js`: first positive mana-spending step commits Escape activation if still eligible; no commit on queue inspection or zero-mana probes. `Actions.restart` retains the original reset.
- `driver.js`: validated numeric/boolean setters and the old `addResource` signature for valid callers, with finite-result checks, worker-safe view guards and in-place registered resource reset.
- `predictor.js`: preserve strict Escape `< 60` admission and gate real Ritual/Imbuement predictions against state-owned caps, including previously forecast increases within a queue. Foreground and Worker use the same rule.
- `scripts/test-rf01-model.mjs` and `scripts/test-balance-contracts.mjs`: update previously bug-preserving R04/R08/RW00 expectations; the RW00 suite now verifies that a mere Escape predicate query leaves the flag false and actual positive spending makes it sticky. Preserve the 157-action registry fingerprint and unrelated R15 Gods Trial characterization.
- `scripts/test-rf03-model.mjs`, `scripts/test-browser-smoke.mjs`, `package.json` and `.github/workflows/validate.yml`: add source-backed assertions and Chrome cases for edited cap UI/save/reload, actual `predictor-worker.js` Data snapshot imports and foreground/background cap-blocked Ritual/Imbuement runs, foreground/background Escape predictions on both sides of 60, and the production `executeGameTicks` scheduler when paused, zero-spending, aborted, started, sticky or reset. Test fixtures use an isolated browser profile and restore an exact pre-scenario save before the inherited suites; no production dependencies or challenge changes.

## Verification actually performed

| Check | Result | Limits |
| --- | --- | --- |
| Source syntax after each first-party classic-script modification | **Passed V8 compilation** | This is not `npm run check` or a full application boot |
| Source-backed RF03 model script evaluated in an isolated V8 model environment | **Passed** | Real production `data.js`, `actionList.js`, `driver.js`, `stats.js`, `actions.js`, `town.js`, `saving.js` and other shared sources were executed with worker-like test facades. This is not the Node filesystem harness nor Chrome |
| Game model bootstrap in that V8 environment | **157 actions**, 27 resources, `buffCaps` and `resources` both registered | No complete campaign simulation |
| Valid resource classes and invalid operations | **Passed**, including numeric +/- fractional deltas, boolean assignments, NaN/Infinity/string/undefined, overflow, snapshot root identity | No authentic old player saves |
| Escape boundary and sticky run behavior | **Passed**, including predicate-only calls, zero mana, first positive step at 59.99, no first start at 60, continuation after 60 and restart | No real frame/deadline clock stress |
| Buff-cap DOM-less snapshots | **Passed**, including defaults, changed values, reset/restore and invalid setter rejection | Actual Chrome UI and real Worker script pending |
| Generated mechanics regeneration | **Baseline exact-match**, candidate reference regenerated from real 157-action model | Reproduced in isolated V8, not the Node generator executable |
| Full registered predicate scan | **Passed:** 422 `visible`, `unlocked`, `canStart` queries evaluated without exceptions or tracked gameplay-state mutations | Synthetic default fixture, not all progression branches |
| Changed JS/MJS syntax | **Passed:** parsed 12 relevant runtime/test files in V8 after removing only ESM import wrappers for MJS | Not the repository `npm run check` |
| Follow-up browser regression test syntax | **Passed V8 parse only:** the modified browser script and separately constructed predictor/scheduler evaluation bodies parse | Actual Node execution, Chrome, Worker and full CI remain untested |

## Validation pending before acceptance

The following commands **have not been executed** in their normal Node/Chrome environments for this candidate:

```sh
npm run check
npm run test:model
npm run test:action
npm run test:rf01:model
npm run test:rf01:challenges
npm run test:rf02:preflight
npm run test:rf02:transaction
npm run test:rf03:model
npm run test:balance
npm run check:mechanics
python scripts/check-xml.py
npm run test:browser
```

Also pending: **execution** of the new real Worker/cap and scheduler/Escape Chrome cases, original challenges 1–3, prestige and RF02 legacy import/restore. The browser script now drives the production `Koviko.instance.doBackgroundUpdate`/`predictor-worker.js` snapshot protocol and `executeGameTicks`, rather than merely launching a separate default-cap Blob Worker. The code is written and parsed, not yet executed under Chrome. At the follow-up review, the PR head had no GitHub Actions workflow run/check result. No claims of full save history or complete campaign parity.

## Acceptance and rollback

- **A1/A5/A6:** DOM-less rule and snapshot model tested; actual Chrome save/reload and production Worker edited-cap parity cases authored, execution pending.
- **A2/A3:** Escape predicate purity and first-spend boundary tested in the model; Chrome scheduler pause/zero/abort/start/sticky/reset and actual foreground/Worker 59.99/60 prediction cases authored, execution pending.
- **A4:** All 27 resource classes and invalid writes tested in the model; downstream browser economy cases pending.
- **A7:** Registry count and regenerated mechanics observed; RW00 Escape expectations updated and a positive-spend case added. The inherited RF01/RF02/balance/challenge/Chrome suites remain pending successful normal CI execution.
- **A8:** Function ownership documented here, in `docs/state-and-saving.md`, `docs/predictor.md` and `docs/reference/code-map.md`; evidence must be updated after CI.

No save key, `ILSV01` envelope, action identifier, town number or production dependency was intentionally changed. RF02's import backups/journal must survive both code deployment and rollback. Do not rollback by replacing or clearing persisted saves. No automatic merge, Pages deployment or release.
