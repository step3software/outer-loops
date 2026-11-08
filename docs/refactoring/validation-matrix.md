# Cross-milestone regression and acceptance matrix

This matrix defines **milestone-level required scenarios**, not an assertion that all are currently covered. RF01's representative suite was **merged** in [PR #4](https://github.com/step3software/outer-loops/pull/4); its [evidence ledger](rf01-evidence.md) records which parts of F01–F15 passed, failed (original R01), or remain untested. **RF02's detailed P01–P22 tests are planned, not implemented**, in [its matrix](rf02-test-matrix.md). RF03 and RF04 have source-backed implementation candidates, but RF04 validation is not yet demonstrated; RF05–RF06 remain future work. Also see [audit coverage](../audit/coverage.md).

## Existing baseline that every milestone inherits

From the current branch, when applicable:

```sh
npm run check
npm run test:model
npm run test:action
npm run test:rf01:model
npm run test:rf01:challenges
npm run test:rf04:model
npm run check:mechanics
python scripts/check-xml.py
npm run test:browser
```

`test:browser` needs Chrome/Chromium and uses a fresh profile. The model test is a worker-like isolated evaluation of real source, not a full browser gameplay simulation. If a refactor changes source file locations, update these harnesses without weakening their assertions; RF05 explicitly owns that adaptation.

## Proposed fixtures and deterministic controls

Use only synthetic, minimally constructed, non-identifying test data. Each scenario should capture initial state, queue, mode, game-speed/offline settings, RNG/clock seed or deterministic substitute, expected resources and town/stat/story counters, and whether the runner is browser or worker-like. Do **not** commit actual player saves. Build independent fixtures so a test failure does not depend on progression through hours of prior gameplay.

Proposed fixture families:

| ID | Baseline scenario | Key expected results | First required by |
| --- | --- | --- | --- |
| F01 | Fresh default save and first queue | 157 registered actions, nine towns; Wander costs 250 mana and advances 200 progress XP; reload retains progress | RF01 |
| F02 | Limited item search/reuse | `total`, `checked`, `good`, `goodTemp` changes; known-good vs unchecked queue semantics | RF01 |
| F03 | Multipart guild/dungeon/trial floor | Segment callbacks, single floor reward, correct counter and stat gains | RF01 |
| F04 | Travel branches | `Face Judgement` reputation 49/50/51 yields intended zones; Open Portal negative delta | RF01 |
| F05 | Normal restart and queue lifecycle | Loop resources and current stats reset; intended progress and next queue persist | RF01 |
| F06 | Challenge modes 1, 2, 3 | Original formulas/speed/restart and save-slot isolation, plus return to normal | RF01 |
| F07 | Predictor foreground/background | Identical initial snapshot and queued actions; prediction vs actual result parity per asserted fields | RF01 |
| F08 | Current and historical encoded saves | Valid `ILSV01` plus legacy aliases, missing fields, `version75`/`maxTown`/story migration | RF01/RF02 |
| F09 | Corrupt/malformed save import | Existing slot and recoverable backup unaffected; error reported without partial apply | RF02 |
| F10 | Ritual and imbuement cap | Same eligibility/buff cap in browser and background predictor, no DOM read in rule calculation | RF03 |
| F11 | Escape at effective-time boundary | `canStart` queries read-only; actual execution preserves original `< 60` eligibility and activation semantics | RF03 |
| F12 | Numeric vs boolean resources | Finite numeric arithmetic, boolean flags, invalid numeric rejection, loop reset and save roundtrip | RF03 |
| F13 | Challenge selection/re-entry | Stable functions; modes 0–3 preserve controls, economy, combat, Mana Burn boundary, independent slots and Worker context | RF04 |
| F14 | Action definition split | Exact ordered registry, action names/`varName`/metadata, all nine zone actions and all three entry points | RF05 |
| F15 | Queue, tooltip, responsive UI | DOM IDs, loadouts, focus, themes, stories, mobile-size layout, predictor overlays and render updates | RF06 |

## Required cross-mode checks per milestone

| Mode / boundary | RF01 | RF02 | RF03 | RF04 | RF05 | RF06 |
| --- | --- | --- | --- | --- | --- | --- |
| Fresh start + action execution | Build | Regress | Regress | Regress | Regress | Regress |
| Save import/export/reload | Build | Own | Regress | Regress | Regress | Regress |
| Loop and prestige resets | Build | Regress | Regress | Regress | Regress | Regress |
| Challenge modes 1–3 | Build | Preserve slots | Regress | Own | Regress | Regress |
| Predictor foreground/worker | Build | Snapshot check | Own relevant paths | Own | Import parity | Overlay checks |
| Action order / source catalog | Snapshot | Unchanged | Unchanged | Unchanged | Own | Unchanged |
| UI keyboard/theme/responsive | Smoke | Error UX | Rule UI parity | Challenge controls | Boot | Own |

Here **Build** means add representative tests, **Own** means directly address with tests, **Regress** means rerun relevant previously established tests, not add a new gameplay feature.

## RF04 verification mapping

- **A1/A2 — F06/F13:** `npm run test:rf01:challenges` and `npm run test:rf04:model` compare original formulas and stable global/Action identities.
- **A3/A8 — F08/F09/F13:** RF02 preflight/transaction tests plus disposable Chrome challenge entry/exit/reload and legacy import protect both slots.
- **A4 — F06/F13:** 0/12/400 gold and 0/2/7500 merchant fixtures, 2× speed and Z3/Z5 visibility-only behavior.
- **A5 — F06/F07:** mode 2 zombie/team combat and synthetic foreground/Worker Fight Monsters prediction.
- **A6 — F06/F13:** mode 3 duration at 0, 86,399, 86,400 and 86,401 total effective seconds, including non-positive budgets.
- **A7 — F07/F13:** actual `predictor-worker.js` and foreground field-level comparisons in modes 0–3.

**These cases are present in the implementation candidate and not verified as passing.** See [RF04 evidence](rf04-evidence.md).

## Evidence template for every implementation PR

```text
Milestone:
Base/head SHA:
Prior characterization test(s):
Changed behavior: none / intentional safety difference (explain)
Commands run and exact results:
Browser, version and mode(s) exercised:
Fixture IDs exercised:
Save/backward-compatibility outcome:
Predictor foreground/background outcome:
Action identity/order checks:
Not run and reason:
Rollback method and test:
Open product/architecture decisions:
```

No milestone is accepted solely on a green syntax check or a single opening Wander run. Do not relax failing tests to get green without explaining whether the original expectation was a bug, which preserved behavior changed, and why.
