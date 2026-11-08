# RF03 implementation readiness — pure gameplay rules and typed resources

**State:** Implementation preparation candidate only. No runtime or test changes, no implementation grant, no merge or deployment.  
**Source inspection:** `main` commit `860872f7db08a1870d33f6105a5d9aae40ea5f18` (2026-11-07). Refresh and reconcile all source anchors after RF02 lands.  
**Approved scope:** [RF03 charter](RF03-gameplay-rules-and-resources.md) A1–A8; [RF03 handoff](handoffs/RF03.md); [prospective G01–G24 test matrix](rf03-test-matrix.md); [RF01 evidence](rf01-evidence.md).  
**Owner decisions (2026-11-07, explicit user message):** **RF03-D05 A:** strict typed resource enforcement, with no legacy sentinel exception. **RF03-D06 A:** Escape activates only at its **first positive mana-spending execution step**, not when eligibility is queried. These are owner planning decisions, not implementation authorization.

## 1. Readiness and authority gates

- **RF01:** Merged characterization in PR #4. Reuse existing models, fixtures, action fingerprint and Chrome/worker smoke; the recorded R04 and R08 baseline failures are expected-to-change observations, not future expectations.
- **RF02 hard dependency:** Current `main` does not contain RF02's implementation. On inspection, `fix/rf02-persistence-safety` was nine commits ahead of `main` and had unmerged changes in `saving.js`, `scripts/test-browser-smoke.mjs`, `package.json`, CI, and save/worker imports. Before starting implementation, confirm RF02's validated import/recovery contracts, acceptance evidence and merge; rebase RF03's implementation off the actual resulting source. Do not build on or merge the abandoned RF02 PR #6.
- **Canonical branch discrepancy:** The repository's GitHub default and this preparation's observed base are `main`, while the currently merged `.orcha/repository.json` and adapter still say `dmchurch` (unavailable). The RF02 branch proposes the owner-selected correction to `main`. Re-verify that correction is merged before orchestrated implementation; do not quietly override the published authority.
- **Orcha lifecycle:** At inspection, `workflow/records.json` on Orcha `main` has `step3software/outer-loops#RF03` in `proposed` with `plan: null` and `preparation: null`. Therefore there is **no accepted plan SHA-256** to use in a validated execution packet. Reconcile the owner-approved RF03 plan/decisions into the governing workflow and obtain its verified plan hash before treating this preparation as accepted or dispatchable.
- **Source and writer protection:** Check current PRs, final base SHA, owner-approved file scope and the fenced writer claim before any code changes. Proposed implementation branch: `refactor/rf03-pure-rules-and-resources` (one focused draft PR against the verified canonical branch, manual merge only).
- **Authorization:** The planning approval and this preparation do **not** authorize implementation, acceptance of an Orcha stage, automatic PR merge or deployment.

## 2. Source-anchored findings

| Concern | Observed ownership at the pinned source | Preparation consequence |
| --- | --- | --- |
| Buff-cap computation | `stats.js` `getBuffCap` reads `document.getElementById` and checks `HTMLInputElement`; `saving.js` already owns `buffCaps` and `buffHardCaps` | Make `buffCaps` the sole authority; keep browser controls as projections/setters |
| Buff-cap load/save | `saving.js` `doLoad` mutates `buffCaps` and an input; `doSave` already writes `buffCaps`; `Data.registerAll` does not include `buffCaps` | Validate incoming cap fields without requiring DOM, register cap state for snapshots and preserve the existing serialized field |
| UI cap setter | `views/main.view.js` `updateBuffCaps` reparses every input using `parseInt` | Validate one cap at a time against a strict integer domain, preserve the last good value and reflect state |
| Escape | `actionList.js` `Action.Escape.canStart` writes `escapeStarted` under `effectiveTime < 60`; `actions.js` `tick` uses eligibility and executes mana ticks | Keep eligibility pure and perform an explicit once-only commit at first *positive* mana spending |
| Reset/worker state | `actions.js` `restart` clears `escapeStarted`; `saving.js` registers it through `globalVariables`; `predictor-worker.js` uses a classic-script model without DOM | Preserve reset/worker snapshot lifecycle; avoid a new global lifecycle hook |
| Resources | `saving.js` defines 27 resource keys; `driver.js` `addResource` assigns all nonfinite/non-number amounts directly | Guard both key class and value; preserve accepted arithmetic, notification and resets |
| Bypass writes | `actionList.js` directly assigns `resources.wizardCollege = true`, `resources.reputation = -1`, and `resources.heart = 0` | Route these through validated setters; preserve exact results and view refresh behavior |
| Resource snapshots | `saving.js` `Data.registerAll` registers the initial `resources` object; `driver.js` `resetResources` replaces the variable with a new object | Characterize snapshot root/reference behavior before choosing in-place reset or synchronized registration |
| Baseline characterization | `scripts/test-rf01-model.mjs` expects predicate-triggered Escape activation and warns about DOM-less `getBuffCap` | Replace bug-preserving assertions with reviewed safety contracts; retain pre-fix evidence |

Key source blobs at inspection: `stats.js` `0bd1036cac84190804a53a326fa4d8404f7e9dd6`; `actions.js` `493e9e9d47e5cfb5ca2892b090215945fcb963c7`; `saving.js` `fafc40e5fa4a83a2f2109c2cd83fa8a7698c5ada`; `driver.js` `3d6297207141ee600b7f24c1f10715744506d1f7`; `views/main.view.js` `bead7d2a4995afaa0cd55f77ddf06b2a9c18d152`. Source hashes are **inspection provenance**, not an instruction to pin the later implementation to stale files.

## 3. Fixed design contracts

### 3.1 Buff caps

- `getBuffCap(buff)` reads an explicit, existing `buffCaps` value, never `document`, `window`, or an input. Avoid a second source of truth or redundant new store.
- Use a validated state setter and a separate UI projection. Accept finite integer caps within `0..buffHardCaps[buff]`; reject invalid, unknown, fractional or out-of-range edits without changing the previous valid cap. On invalid input, restore the displayed last-valid value and surface a controlled error; do not change a gameplay cap implicitly during display.
- Preserve existing default values, buff identity and the save field `buffCaps`; missing legacy values use existing defaults. Any invalid stored cap policy must agree with RF02 preflight and be non-destructive before game state is applied.
- Register the existing `buffCaps` object as a `Data` root before `Data.recordDefaults()`; ensure worker default ID/snapshot import and foreground state match without DOM. Reconcile changes to in-memory caps with snapshot invalidation/refresh as required by existing predictor mechanics.
- No new serialized field, HTML ID, runtime dependency, feature UI, buff maximum or balance change.

### 3.2 Predicate purity and Escape commit

- Audit `visible()`, `unlocked()`, `canStart()` and indirect helpers for mutations. They must not grant resources, update story, change progression, or set `escapeStarted` merely by being queried. **Do not confuse this with `getNextValidAction()`:** that scheduler also intentionally advances queue position and records errors; only eligibility evaluation must be observational.
- `Action.Escape.canStart()` becomes equivalent to `escapeStarted || effectiveTime < 60`, with no side effect.
- On **the first actual positive mana-spending step** of Escape, check eligibility at that execution boundary and set `escapeStarted = true` exactly once *before* the positive mana spend. An inspection, paused queue, zero-mana tick, rejected/aborted action or later queued Escape that has not spent mana must not set it.
- If the first prospective spending step occurs at or after `effectiveTime = 60` with `escapeStarted` false, it must not spend mana or activate; follow the existing failed/skipped queue handling. If a positive spending step activated below 60, retain sticky eligibility beyond 60 for that run.
- Preserve `actions.restart()` clearing the flag. Reuse the existing scheduler boundary rather than introducing an application-wide action lifecycle API. Any genuinely new global lifecycle contract requires an ADR and separate review before expansion.
- Protect at 59.99, exactly 60 and 60.01 effective seconds; test first spending, zero/probe path, cross-threshold continuation, restart and repeated polling.

### 3.3 Strict resources (RF03-D05 A)

**Numeric (18):** `gold`, `reputation`, `herbs`, `hide`, `potions`, `teamMembers`, `armor`, `blood`, `artifacts`, `favors`, `enchantments`, `houses`, `pylons`, `zombie`, `map`, `completedMap`, `heart`, `power`.

**Boolean (9):** `glasses`, `supplies`, `pickaxe`, `loopingPotion`, `citizenship`, `pegasus`, `key`, `stone`, `wizardCollege`.

- Derive key types from the existing `resourcesTemplate`; make a checked numeric delta helper and an explicit boolean setter. Keep `addResource(resource, amount)` as a small type-dispatch compatibility adapter for *valid* existing callers while migrating direct assignments. Use JSDoc key types; do not require a TypeScript conversion.
- Numeric delta and preexisting numeric value must be finite numbers; the **result** must also be finite. Preserve negative balances, negative and fractional deltas where historically valid; do not introduce integral-only counters or arbitrary new bounds. Boolean keys accept only actual `true`/`false`.
- Unknown keys, wrong-class writes, strings, `undefined`, `null`, `NaN`, `Infinity`, `-Infinity` and finite-value overflow must reject **before** state/view/snapshot changes. No sentinel exception, numeric coercion, default-to-zero, or silent corruption. Emit a controlled, testable error with no save mutation.
- Preserve existing `view.requestUpdate("updateResource", key)` and combat panel notifications for valid operations. Rejection must not enqueue a success-looking update.
- Preserve `resetResource`, `resetResources`, default glasses grant, prestige/challenge/reset and predictor snapshots. Verify that replacing the `resources` object does not orphan the `Data` root; prefer in-place, key-checked reset if the source-backed regression proves compatible.

### 3.4 Compatibility boundary

Keep `ILSV01`, normal/challenge save keys, RF02 recovery and original backup preservation, buff cap field names, all 157 action identities/order, original nine zones, classic-script load order and original rewards/costs. Gameplay resources are loop-scoped; do not add them to the serialized schema as a side effect. Do not modify RF04 challenges, RF05 action organization, RF06 view architecture, Real World potion/route rules or the unrelated R15 Gods Trial predictor discrepancy.

## 4. Exact future implementation file contract

These are **prospective source changes**, not files changed by this preparation. Reconfirm the actual RF02-integrated base and writer ownership before beginning.

| Operation | Exact path | Concrete implementation | Required proof |
| --- | --- | --- | --- |
| Modify | `stats.js` | Replace DOM-dependent `getBuffCap` with model-state read | G01–G04 |
| Modify | `saving.js` | Validate/rehydrate existing caps, snapshot-register `buffCaps`, preserve saved shape and resource type defaults | G03–G07, G17–G20 |
| Modify | `views/main.view.js` | Make cap input changes validated state writes with display rollback for invalid edits | G03–G05 |
| Modify | `actionList.js` | Remove Escape predicate mutation; migrate three direct resource writers through typed operations | G08–G13, G16 |
| Modify | `actions.js` | Commit Escape once at first positive mana-spending step, preserving scheduler failure/restart semantics | G08–G13 |
| Modify | `driver.js` | Guard numeric/flag writes, old `addResource` signature and resets; protect snapshot ownership | G14–G20 |
| Modify | `scripts/test-rf01-model.mjs` | Change the two known-defect expectations to reviewed corrected behavior; retain before/after provenance | G02, G08, G09 |
| Create | `scripts/test-rf03-model.mjs` | Deterministic DOM-less cap, predicate, Escape and resource contract tests | G01–G04, G08–G18 |
| Modify | `scripts/test-browser-smoke.mjs` | Add real cap edit/save/reload, ritual and imbuement worker comparison, restart, normal/challenge tests | G05–G07, G11–G13, G19–G23 |
| Modify | `package.json` | Add `test:rf03:model` runner without new production packages | G24 |
| Modify | `.github/workflows/validate.yml` | Run RF03 model alongside inherited model/browser/RF02 gates | G24 |
| Modify | `docs/state-and-saving.md` | Document cap and resource ownership, save/default/reset lifetimes and snapshot rules | A5, A8 |
| Modify | `docs/predictor.md` | Document authoritative cap snapshot and worker parity contract | A1, A5, A8 |
| Modify | `docs/development/validation.md` | Add actual RF03 commands and verified coverage only after execution | A7, A8 |
| Modify | `docs/reference/code-map.md` | Clarify rule/resource/commit ownership at existing files | A8 |
| Modify | `docs/audit/findings.md` | Update R02/R04/R08 only with passing evidence; preserve R15 as separate | A2–A4 |
| Modify | `docs/refactoring/decision-log.md` | Reconcile RF03-D05 A and RF03-D06 A with RF02's merged edits; do not overwrite RF02 decisions | Decision provenance |
| Create | `docs/refactoring/rf03-evidence.md` | Record base/head, regression expectations, executed results and rollback per A1–A8 | A1–A8 |

`predictor-worker.js`, `predictor.js`, `data.js`, `index.html` and `challenges.js` are validation surfaces, **not** default edit targets. If a necessary change in one is discovered, reconcile the exact file scope before implementation instead of silently widening it.

## 5. Sequential work inside one focused implementation PR

1. **Characterize:** record the RF01 baseline (R02/R04/R08), map indirect resource mutations and producer types, and write targeted red-on-old / green-on-new tests. Keep other baseline suites intact.
2. **Buff caps:** establish the authoritative model/setter, save and snapshot invariants; verify DOM-less model and real browser input parity.
3. **Escape:** purify eligibility and place a once-only positive-spend activation at the original execution boundary; test failed, paused, zero-spend and cross-threshold sequences.
4. **Resources:** introduce guarded operations and an old-signature adapter, migrate direct writers, test result overflow, reset/snapshot identity and all known flags.
5. **Integrate:** run the [RF03 matrix](rf03-test-matrix.md), RF01/RF02 cases, normal/challenge/prestige/worker smoke, and update ownership/evidence documentation. Publish one targeted **draft PR**, no merge/deploy.

Do not split into competing global state frameworks or use a new bundle/build pipeline.

## 6. Verification, rollback and exit

Run from the verified source with installed Node/Chrome/Python:

`npm run check`  
`npm run test:model`  
`npm run test:action`  
`npm run test:rf01:model`  
`npm run test:rf01:challenges`  
`npm run test:rf02:preflight` (after RF02 integration)  
`npm run test:rf02:transaction` (after RF02 integration)  
`npm run test:rf03:model` (new in implementation)  
`npm run check:mechanics`  
`python scripts/check-xml.py`  
`npm run test:browser`

Exercise foreground/worker comparisons, both save slots, normal/challenge/prestige, restart and recovery. Actual runs/results must be recorded in `rf03-evidence.md`; **none of these commands was run for this documentation preparation**.

Rollback is code-only **only if** existing `buffCaps` save representation and RF02 storage/recovery contracts remain stable. Prove a current export still loads on the prior build and that no pre-import backup/journal is overwritten. Invalid-resource rejection is an intentional safety correction and remains covered even if the rest of the refactor is reverted.

**Exit gate:** A1–A8 and G01–G24 passing with explicit permitted exceptions; no action identity, cost/reward or save-contract changes; RF02 merged and green; recorded approved plan SHA and separate implementation authorization; one draft PR for manual review and merge.
