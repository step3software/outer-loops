# Findings and risk register

These are **auditable findings**, not an assertion that every candidate is a reproduced bug. Evidence is linked to executable source. Severity is qualitative and assumes a future developer may modify the affected subsystem. Assign issues only after reproduction/triage.

## Highest-priority findings

### R01 — Save import persists before validating (high; confirmed control flow, user impact untested)

**Evidence:** `saving.js` `processSave(saveData)` decompresses or decodes data, calls `storeSaveJson(saveJson)` *before* invoking `load(null, saveJson)`. `load` parses nonempty JSON with `JSON.parse` and has no surrounding rollback in `processSave`.

**Consequence:** if a nonempty decoded save is invalid JSON or incompatible, the existing local save can be overwritten before parsing fails. **RF01 reproduced this overwrite with nonempty invalid-JSON `ILSV01` data in an isolated Chrome profile** (see [RF01 evidence](../refactoring/rf01-evidence.md) F09), restoring the test slot afterward. This is a **data-loss risk** for users; no actual incident is asserted.

**Acceptance for a future fix:** validate JSON and required structure before replacing any active save; keep the prior copy recoverable; demonstrate invalid, truncated, old-format and valid imports using a disposable profile. Preserve `ILSV01` and compatibility.

### R02 — Numeric resource setter accepts NaN/Infinity as assignment (medium; confirmed code path)

**Evidence:** `driver.js` `addResource(resource, amount)` adds a finite number, but assigns `amount` directly for **any** non-finite value. That path is required for boolean resources but also accepts `NaN` and `Infinity`. The `Invest` action contains an explicit guard/comment against non-finite gold in `actionList.js`.

**Consequence:** an invalid numeric reward or calculation can poison resource state and later computations. Treat as a correctness boundary requiring schema-aware validation, not permission to prohibit boolean resources.

**Acceptance:** verify boolean assignment still works; finite positive/negative numeric changes work; NaN/Infinity cannot silently corrupt numeric resources; test downstream actions and save serialization.

### R03 — Challenge modes overwrite executable functions (medium; confirmed architecture)

**Evidence:** `challenges.js` `loadChallenge` replaces `Action.BuyManaZ1` callbacks in mode 1, combat functions in mode 2 and global `restart` in mode 3. `exitChallenge` performs a page reload.

**Consequence:** assumptions about stable function identity, predictor snapshots and in-place switching may not hold. Not necessarily a bug: it is the current implementation, and leaving through reload is intentional.

**Acceptance:** entering/exiting each challenge, isolated saves, changed queue, worker predictions and reload must be tested before touching the challenge code.

### R04 — DOM-dependent buff cap from shared runtime code (medium; worker parity risk, unverified failure)

**Evidence:** `stats.js` `getBuffCap` reads a DOM element and checks `HTMLInputElement`. Runtime `Action.DarkRitual` / `Action.ImbueMind` call `getBuffCap` in `canStart`. `predictor-worker.js` imports `stats.js` and `actionList.js` but has no `document`.

**Consequence:** evaluating this path in a DOM-less simulation *could* throw or diverge. **RF01 confirmed that directly calling `getBuffCap("Imbuement")` in the DOM-less Node model fails**; this does **not** establish that any specific background Worker ritual prediction actually fails. See [RF01 evidence](../refactoring/rf01-evidence.md) F10.

**Acceptance:** construct a queued ritual/imbue scenario with predictor on/off, foreground/background; ensure equivalent caps and no DOM access in worker code.

### R05 — Escape story sequencing has a documented flaw (medium; maintainer FIXME)

**Evidence:** the `Action.Escape.story` callback in `actionList.js` explicitly comments that unlocking a later global story also unlocks the earlier Looping Potion story even if the player did not craft it.

**Consequence:** narrative completion can overreport an earlier milestone. Distinguish a known narrative correctness issue from the source's unlock mechanics; fix requires explicit product/story decision.

**Acceptance:** test Jungle Escape before the Looping Potion branch and after crafting; earlier story should unlock only under intended conditions.

## Additional findings and system constraints

| ID | Priority | Status | Evidence / interpretation | Practical mitigation |
| --- | --- | --- | --- | --- |
| R06 | High (business) | Confirmed repository metadata | No recognized root/software license for this fork or parent; rights for commercial distribution are not established | Review upstream rights/permissions before distribution; preserve attribution |
| R07 | Medium | Partially addressed in unmerged RF01 PR #4 | No historic *authentic* save corpus or full end-to-end playthrough; RF01 now adds synthetic old-shaped imports, normal/challenge/prestige reset and browser-worker Wander parity tests | Keep extending fixtures without claiming real old-save compatibility or a full game simulation |
| R08 | Medium | Source confirmed; RF01 predicate test | `Action.Escape.canStart` mutates `escapeStarted` at 59.99 effective seconds, remains sticky after 60, and returns false at 60 if not started; RF01 checks direct calls, not full scheduler parity | Audit queue/prediction side effects before RF03 pure-predicate refactor |
| R09 | Medium | Source-confirmed integration risk | `GoogleCloud.init` polls availability of external Google scripts without a finite give-up branch | Add bounded failure handling and opt-in test-account smoke in a separate change |
| R10 | Low | Incomplete/experimental feature | `talents.js` declares `playerTalents`, with tree edge drawing commented; it is not serialized by `doSave` | Do not describe the displayed talent tree as an established, saved ability system |
| R11 | Medium | Source-confirmed behavior | `PrestigeUpgrade` calls `addBuffAmt` then subtracts cost; `addBuffAmt` is a no-op at the hard cap | Verify UI disallows at-cap purchase before concluding points can be lost; add explicit model guard if reproducible |
| R12 | Low | Naming/history ambiguity | `doSave` writes `storyReqs` while runtime uses `storyFlags`; queue migration renames old actions, and some older fields use `version75` | Preserve serialized legacy names and add migration fixtures |
| R13 | Medium | Technical debt | No runtime bundler/module graph and major mutable-globals dependencies | Prefer small reversible patches, document script-order and worker imports |
| R15 | Medium | **Reproduced parity discrepancy in RF01** | Real runtime callback grants power after floor **100**; predictor `Gods Trial` callback grants it on floor counter **99**. RF01 runs both in isolated Chrome. No entire-trial natural playthrough was performed | Resolve with a focused predictor-parity test/fix; track via [RF01 PR #4](https://github.com/step3software/outer-loops/pull/4) (GitHub Issues disabled) |
| R14 | Low | Documentation limitation | Static metadata extracts direct effects, but callbacks invoke indirect helpers and conditionals | Treat the generated action reference as an index, inspect linked callback code for exact results |

## Verification policy

- **Confirmed control flow:** directly visible in source, but impact may remain untested.
- **Plausible risk:** credible interaction inferred from two or more paths, not a reproduced fault.
- **Regression debt:** absence of coverage, not a code defect.
- **Gameplay judgment:** separate from correctness; see [gameplay review](gameplay-review.md).

RF01 [PR #4](https://github.com/step3software/outer-loops/pull/4) adds **regression tests only**, not gameplay fixes, and **is now merged into `dmchurch`**. The findings above distinguish initial source evidence from later isolated reproductions; other entries remain unverified. GitHub Issues is currently disabled (HTTP 410), so dedicated issue creation for R01/R15 was blocked; use this risk ledger and PR until issue tracking is enabled. When implementing a fix, create a reproducible failing test before changing the mechanic whenever feasible.
