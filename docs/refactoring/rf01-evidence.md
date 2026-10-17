# RF01 implementation evidence and coverage ledger

**Status:** RF01 implementation **in review** — [PR #4](https://github.com/step3software/outer-loops/pull/4), branch `test/rf01-regression-coverage-20261017`. This document records the **executed characterization suite**, not a fully validated complete-game playthrough. The PR is stacked on the unmerged [RF01–RF06 planning branch](README.md) (PR #2), itself based on the audit PR #1. **Not merged.** No gameplay rules, graphics, saved-field schemas or balance values have been changed.

**Canonical charter:** [RF01](RF01-regression-coverage.md). **Next prerequisite:** [RF02 save safety](RF02-persistence-safety.md). **Existing risks:** [audit findings](../audit/findings.md).

## Reproduce it

Use Node.js **22+**, Python 3 and Chrome/Chromium (the latter for `test:browser`); run from the repository root:

```sh
npm run check
npm run test:model
npm run test:action
npm run test:rf01:model
npm run test:rf01:challenges
npm run check:mechanics
python3 scripts/check-xml.py
npm run test:browser
```

GitHub Actions workflow `.github/workflows/validate.yml` runs all eight checks in order. `test:browser` serves the real `index.html` on an ephemeral loopback HTTP port, launches Chrome in a **new disposable profile**, and removes the profile. No Google account, cloud save, or real user data is accessed.

## Added/changed test surfaces

| Test source | Execution mode | What it actually asserts |
| --- | --- | --- |
| `scripts/test-rf01-model.mjs` | Fresh isolated Node VM, real runtime files | Ordered 157-action identity fingerprint; normal/progress queues and cost skip; limited known-good/unchecked; Fight Monsters and Small Dungeon actual tick; seeded dungeon reward; Gods Trial 99/100; Dead Trial and zombie/blood; Looping Potion → Totem → Wunderkind; 49/50/51 route; 59.99/60 Escape predicate; restart lifetimes and queue records; gold/interest; fractional Mana rounding and `loopsType`; DOM-less buff-cap risk |
| `scripts/test-rf01-challenges.mjs` | Separate Node VM per challenge and normal baseline | Original Mana Drought merchant cap/2× speed/replacement callbacks, Noodle Arms combat formulas, Mana Burn restart budget, normal functions restored in a fresh realm |
| `scripts/rf01-fixtures.mjs` | Synthetic objects derived from a fresh disposable browser save | Current `ILSV01` input, two independently reconstructed legacy field/name combinations, challenge-shaped save; invalid-data candidates (not actual old player exports) |
| `scripts/test-browser-smoke.mjs` (expanded) | Actual local Chrome page and Web Worker | Original boot/English XML/157-action/Wander/save+reload; valid and old-shaped compressed imports/aliases; invalid-JSON import unsafe baseline; foreground & real Worker prediction compared to actual Wander; Gods Trial predictor boundary; all three challenge mode entry/exit slot/reload; original prestige 90→30→60 and backup |
| `scripts/load-game-model.mjs` (extended) | **Test-only** scaffolding | Optional `challenges.js` loading, minimal view/input/localization/`setStoryFlag` proxies, multipart totals otherwise initialized by browser `doLoad`. Does **not** patch the actual game source |

**Important:** Stubbed `View`/`ActionLog` methods do not prove rendering/story presentation; browser tests cover a different, smaller set of actual UI/slot behaviors. Some fixtures **seed levels/progress directly**; they do not claim a player can naturally reach that state in a short playthrough.

## Original action registration contract

The deterministic, **insertion-ordered** tuple stream `[Action key, name, varName, townNum, type, segments]` of 157 initialized actions is frozen by SHA-256:

```text
e2033a91c69c508845eea537903a2355dc4a902db5b66f6b99be67ef99b3a7c9
```

Tests fail if it changes unexpectedly. This is an RF05 preparation/compatibility safeguard: a future legitimate action change needs a reviewed expectation update with save, worker, zone and gameplay consequences, **not** a silent golden-fingerprint refresh.

## Executed scenario coverage vs original plan

The F01–F15 IDs are defined in the [cross-milestone matrix](validation-matrix.md). "Partial" means specific representative checks exist but the entire written scenario is not verified.

| ID | RF01 evidence | Status and limitations | Downstream owner |
| --- | --- | --- | --- |
| **F01 — default boot/queue** | Real Chrome boot; 157 actions, nine towns; queued Wander spends 250 mana → 200 town XP; fresh reload retains data | **Covered (representative)** | All |
| **F02 — limited known-good vs unchecked** | Real `SmashPots.finish()` and `Town.finishRegular()`: known-good reuse uses stock without checking another, ten checks find one good pot; `loopsType` preserved for knownGood/unchecked | **Covered at callback + queue-mode level**; not a full repeated `actions.tick` run for both modes | RF03/RF05 |
| **F03 — multipart/dungeon/trial** | `Fight Monsters` actual queued segment gives gold; `Small Dungeon` real queued floor, seeded reward/`ssChance`; `Dead Trial` floor adds zombie; Gods Trial `loopsFinished` floor99 vs100 | **Covered representative cases**; not all dungeons/25–100 trial floors or guild ranking | RF03/RF05 |
| **F04 — travel branches** | `getTravelNum("Face Judgement")` at reputation 49/50/51 gives +2/+2/+1 | **Partial:** exact branch function verified; full walk, Open Portal negative delta and other shortcuts still untested | RF05 |
| **F05 — restart/queue** | Real `restart()` clears gold/supplies/clock and resets current queue while preserving `expWander`, Combat, talent and planned loops; disabled/empty-queue tests; fractional `Mana.floor/ceil` | **Partial:** fractional full tick execution, pause-before-restart and offline budgeting still untested | RF03/RF05 |
| **F06 — challenge modes** | All three existing modes characterized in separate VMs and **real Chrome**, with separate normal/challenge slots, exit/refresh to normal, retained normal progress | **Covered entry/exit + primary formulas**; full gameplay through each mode untested | RF02/RF04 |
| **F07 — predictor parity** | Real `Koviko.instance.update` foreground and **actual Worker** vs executed Wander; predicted 250 mana, stat XP difference ≤1; worker/main equal relevant fields; actual world unchanged by prediction | **Covered for Wander only.** Field contract: numeric mana exact, stat XP ±1 (stat training may vary with rounding), actual town progress 200; late-game Gods Trial prediction **known divergent** (R15). Many action types and snapshot-stress not covered | RF03/RF04 |
| **F08 — saves/migrations** | Compressed `ILSV01` current roundtrip; synthetic `maxTown`, missing `version75`, legacy `storyReqs`, queues/loadout aliases `Train Dex`, `Sell Gold`, `Tournament` and `Purchase Mana`; original prestige reset/backup; challenge slots | **Covered for constructed shapes, NOT an authentic historical-save corpus.** Cross-version external compatibility still unverified | RF02 |
| **F09 — invalid imports** | In isolated Chrome, compressed nonempty invalid JSON leads to parse exception and **overwrites active localStorage before validation**; test restores synthetic prior bytes | **Known failure R01**, *deliberately not required to remain unsafe*. Invalid object schemas, quota and interrupted backup recovery not yet systematically tested | **RF02** |
| **F10 — ritual buff cap** | Direct DOM-free `getBuffCap("Imbuement")` characterized as needing a DOM, log R04 | **Partial:** direct model failure, not proof a particular Worker prediction fails; browser Ritual/Imbue parity pending | RF03 |
| **F11 — Escape** | Predicate at 59.99 effective sec sets `escapeStarted`; sticky after 60; false at exactly 60 if never started | **Covered predicate risk R08**; queue-time side effects still need explicit test before RF03 pure eligibility | RF03 |
| **F12 — resource types** | Normal gold→mana, boolean supplies/potion/blood, investment/interest, finite example amounts tested | **Partial:** invalid NaN/Infinity and typed contract not fixed/tested exhaustively | RF03 |
| **F13 — challenge policy** | Modes 1–3 and return to baseline show original monkey patches and storage behavior | **Characterized**; no new policy implemented | RF04 |
| **F14 — action module split** | Exact ordered registry fingerprint, 157 source action identities and generated metadata check | **Baseline frozen**; game/worker/editor after future split not exercised | RF05 |
| **F15 — UI decomposition** | Actual Chrome boot, save/reload, menu-driven challenge entry/exit and prestige reset | **Partial:** keyboard/theme/responsive/drag-drop not checked | RF06 |

## Known findings **observed during RF01** — do not hide or turn into desired behavior

| Ref | Evidence recorded in CI | Implication |
| --- | --- | --- |
| **R01** | Invalid-but-decodable compressed import stores bad JSON to `idleLoops1` **before** parse throws. Isolated test repairs it. | **Confirmed reproducible data-loss risk**. RF02 must validate input **before** touching active storage and provide recoverable backups. |
| **R04** | `getBuffCap` throws in DOM-less Node model when invoked directly because it expects browser input objects. | **Confirmed direct dependency**, but a concrete foreground vs Worker Ritual/Imbue forecast error is **not** established by this test. RF03 should make rules state-driven. |
| **R08** | `Action.Escape.canStart` mutates `escapeStarted` while checking eligibility. | Characterization only: no permanent endorsement of side-effecting predicates. RF03 owns pure predicate conversion. |
| **R15** | Predictor's `Gods Trial` model grants one power on its 99th-floor counter, while actual `TrialAction.loopsFinished` gives it upon completing floor100. | **Confirmed parity discrepancy**, not corrected in RF01. Future predictor work should add failing/green parity coverage at the boundary. |

These issues have distinct owners; RF01 intentionally does **not** alter their production behavior. **Issue tracker limitation:** attempts to open dedicated R01 and R15 GitHub Issues returned HTTP 410 because Issues is disabled for this repository. Until tracking is enabled, this evidence ledger, [audit findings](../audit/findings.md) and [PR #4](https://github.com/step3software/outer-loops/pull/4) are the persistent tracking references. Any later fix PR should cite the relevant risk ID. The separate-issue portion of charter A6 is **blocked by repository configuration**, not silently marked done.

## Acceptance criteria A1–A8: readiness assessment

| Criterion | RF01 implementation assessment |
| --- | --- |
| **A1** Synthetic deterministic fixtures | **Met for checked fixtures**. RNG fixed for dungeon soulstone reward; fresh browser profile and no private saves. History simulated from code, not genuine old exports. |
| **A2** Four action types and dungeon/trial | **Met for representative cases**. Actual queue, limited callbacks and deterministic dungeon/trial state changes checked. |
| **A3** Reset/challenge/prestige, queue behavior | **Met for critical boundaries**, with residual untested fractional-tick, pause and background timing noted above. |
| **A4** Current/legacy and invalid imports | **Met for two distinct synthetic legacy shapes and truncated JSON**, while R01 unsafe storage is treated as a defect. |
| **A5** Challenge modes 1–3 / return to normal | **Met for entry/exit/reload and primary formulas** in Chrome and VM. |
| **A6** Foreground and worker parity | **Met for one representative action** and documented numeric tolerance, with R15 explicitly logged/quarantined. **Partial against literal charter wording:** can't link a dedicated GitHub Issue while Issues is disabled (HTTP 410); risk is tracked in audit/PR. No broad predictor parity claim. |
| **A7** CI + real Chrome | **Met** — both new model commands and expanded Chrome test run in GitHub Actions alongside original checks. |
| **A8** Coverage and limitations | **Met by this ledger**, with explicit partial and untested scenarios. |

RF01 is therefore **implemented as a substantial regression-coverage foundation and ready for review**, not merged and **not proof of comprehensive gameplay correctness**. The separate GitHub Issue required by the literal A6 criterion is blocked because Issues are disabled; tracking stays in the audit and PR until enabled. Later milestones must grow specific assertions as they refactor the affected systems.

## CI evidence and rollback

Latest verified successful PR-run evidence should be copied into the PR description with the exact run/commit (this file intentionally does not freeze a rapidly changing head SHA). At the expanded RF01 baseline, CI passed JS/Markdown checks, the 157-action metadata check, isolated action/model/challenge suite, XML parser, real Chrome imports/slot transitions/prestige and actual foreground/worker Wander prediction. The known R01/R04/R15 warnings are deliberate **characterization signals**, not green indicators of fixed bugs.

All changed files are regression-test scripts, their npm/CI wiring and documentation. **No** original `actionList.js`, `driver.js`, `saving.js`, `challenges.js`, `prestige.js`, `stats.js` or production UI is modified. Rollback is to revert PR #4; it does not require player-save migrations.

## RF02 / other milestone handoffs

- **RF02:** Start from `scripts/rf01-fixtures.mjs` and `test-browser-smoke.mjs` invalid `ILSV01` case. Extend to bad Base64, structurally wrong JSON, quota and partial-write/recovery. Add before/after assertions that normal/challenge/`prestigeBackup` bytes are retained on failure, and don't blindly preserve R01.
- **RF03:** Use `scripts/test-rf01-model.mjs` `getBuffCap`, `Escape`, resource and fractional examples as failing/characterization baselines. Add full foreground/Worker ritual scenarios.
- **RF04:** Use `scripts/test-rf01-challenges.mjs` and actual browser challenge modes 1–3. Replace monkey patches only in a separately approved implementation, with formula/slot parity.
- **RF05:** Keep the action fingerprint and regenerate source docs after any legitimate split. Do not consider sorted action sets sufficient.
- **RF06:** Keep browser boot and challenge/menu/upgrade smoke. Build actual UI focus, theme, keyboard and resize characterization *before* moving views.

**Next authorized action:** Review PR #4 and optionally merge when separately requested. **RF02–RF06 are not authorized by this PR.**
