# Audit coverage and test evidence

## RF01 regression implementation — subsequent evidence

This audit was written before the [RF01 implementation PR #4](https://github.com/step3software/outer-loops/pull/4). On the **now-merged default branch**, actual queued dungeon/multipart/trial actions, synthetic current/legacy imports, challenge modes 1–3, original prestige purchase/reset and one real foreground/Worker predictor Wander comparison are now exercised. See the [RF01 evidence ledger](../refactoring/rf01-evidence.md) for authoritative scenario results, CI commands and limitations. Existing as-coded audit findings R01/R04/R08/R15 are reproduced/characterized, **not repaired**. Baseline audit table and unverified list below are **historical to the initial audit**, not a statement that RF01 did not run.

## What was and wasn't verified

This original audit covers (1) a cross-file inventory and key control-flow inspection, (2) direct inspection of core formulas, boundaries and error paths, and (3) source-derived runtime metadata from **all 157 initialized actions**. It does **not** constitute a complete manual end-to-end playthrough, comprehensive browser gameplay suite, or exhaustive old-save migration check.

| Domain | Source examined | Automated checks | Still unverified |
| --- | --- | --- | --- |
| Boot/deployment | `index.html`, package, GitHub workflows | JS syntax, linked scripts, isolated Chrome boot | Actual deployed Pages release |
| Actions / nine zones | `actionList.js`, `town.js`, `saving.js` | 157 runtime objects; generated reference; catalog parity | All player-facing gates and rewards in play |
| Queue and timing | `driver.js`, `actions.js` | Isolated queue test and real-Chrome Wander execution | Full queue simulation, fractional mana, background timing |
| Stats/combat/prestige | `stats.js`, `prestige.js` | XP and prestige defaults in worker-like model | Compound buffs, dungeon outcomes |
| Save/migration | `saving.js`, `actionLog.js` | Code-path inspection and Chrome current-save/reload smoke | Valid/corrupt and historic save import/migrations |
| Challenges | `challenges.js` | Mode code inspected | Challenge modes 1–3 in browser |
| Predictor | `predictor.js`, `predictor-worker.js`, `data.js` | Worker-import-like model load | Real predictor parity/snapshot stress |
| UI | `views/*`, `uicomponents.js`, CSS, HTML | JS syntax, script presence | Keyboard, responsiveness, themes, tooltip interactions |
| Localization | `localization.js`, `lang/*/game.xml` | XML/RNG parse and English Chrome startup | Key-to-label completeness and full narrative |
| Editor | `editor.html`, `editor.js`, `schema.js`, `data/*` | Syntax and XML parse | Live editor round-trip and schema semantics |
| Cloud | `google.js` | Implementation inspected | OAuth and Drive save in dedicated test account |
| Licensing | GitHub metadata and root listing | No explicit license found | Rights holder clearance |

## Evidence from GitHub Actions

- `npm run check`: JS syntax for first-party code, Markdown link existence, game/editor script paths, compact action-catalog ID parity.
- `python3 scripts/check-xml.py`: well-formed XML/RNG parsing, not schema semantic validation.
- `npm run test:model`: executes real first-party code in a Node VM modeled after worker initialization, verifies 157 actions, nine towns, stat/skill/buff registries, XP formula and prestige defaults.
- `scripts/generate-action-mechanics.mjs`: introspects executable action instances to generate the extensive reference. `--check` detects later drift.
- `npm run test:browser`: uses a disposable local Chrome profile and real `index.html` to verify English XML initialization, 157 actions, Wander queue execution, browser save serialization and persisted progress after a page reload.

At the earlier foundation PR check, CI recorded **31 JS syntax checks, 36 Markdown files / 79 Markdown links, 48 local scripts, 157 catalog actions and five XML parses**. New PR runs have different file counts. Cite the current workflow log for latest results.

## Explicit missing evidence

1. A full playable new-save to Restore Time run, or measured pacing from such a run.
2. Historical save corpus with known-good expected results for each migration.
3. Automated predictor-to-actual gameplay parity.
4. Real browser accessibility/visual interaction checks and mobile/performance sampling.
5. External Google cloud integration in a dedicated account.
6. Complete narrative text proofing and semantic Relax NG editor validation.

## Proposed reproducible gameplay scenarios

| Stage | Fixtures / assertions |
| --- | --- |
| Fresh run | First actions, Wander progress, early mana purchase, queue reset |
| Early production | Known-good pots/quests, herbs, potion craft/sale, trade |
| Combat and guilds | Guild rank, team/armor, Small/Large Dungeons and trial rewards |
| Branching | Reputation exactly 50 and either side, Open Rift/Underworld/Guru, portal backtrack |
| Dark | Ritual cap, blood/zombie strength, Dead Trial floor/reward |
| Jungle | Timed Escape before and after first eligibility check, Open Portal |
| Survey | Explorer Guild bootstrap and completed-map exchange |
| Commerce | Investment cap, interest, key purchase and Leave City |
| Endgame | Four stone sources, full tower, power 1–8, Restore Time and prestige |
| Meta | Imbue Soul reset/carryover, challenge return, import/export with corruption |
| Predictor | Main thread and worker compared to actual queue on each stage |

For each case capture exact starting state, expected values, runtime/browser version and outcomes. Mark unrun cases explicitly: this audit should not be used as evidence of completed gameplay testing.

## Confidence

The executable action **inventory** is source-complete for the branch baseline. Control-flow and formula analysis is substantial but not a proof that every edge case works, that published UI is accessible, or that costs are optimally balanced.
