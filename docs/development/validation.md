# Verification and regression matrix

## Automated baseline

From the repository root:

```sh
npm run check
npm run test:model
npm run test:action
npm run check:mechanics
python scripts/check-xml.py
```

`npm run check` verifies syntax for first-party `.js` / `.mjs` files (including validator scripts), relative Markdown file links, known entry-point assets and consistency of the documented `Action.*` inventory. The worker-like model test initializes real game code and checks action registry/formulas. The queued-action test executes an opening Wander in the real queue engine with a no-op UI facade. Generated mechanics must match all live action definitions. These do not replace browser testing. The Python script checks that the checked-in `.xml` and `.rng` files parse as XML. The PR workflow runs these checks automatically.

**No established automated browser gameplay tests or save migration fixtures existed at this baseline.** A green static check is not a gameplay test. Do not report otherwise.

## Minimum interactive smoke suite

Use a *disposable* profile or exported test save. For each row, record browser, result and any errors; mark steps **not run** rather than guessing.

| Scenario | Exercise | Expected observation |
| --- | --- | --- |
| Fresh boot | Open `/` with empty test-profile storage | Localization loads; menus and actions render; no uncaught JS/XML errors |
| Basic queue | Queue starting actions (for example Wander), run, pause/resume | Action progress/experience changes sensibly and UI reflects it |
| Loop boundary | Exhaust queued actions or time; allow restart | Temporary resources/time reset while intended long-term progress remains |
| Queue editing | Change loops, reorder, disable, add/remove actions | Next action list and execution order stay consistent |
| Zone travel | Unlock and queue a reachable travel action | Player enters correct zone; actions appear with expected availability |
| Limited action | Discover limited items; repeat/use known-good items | Checked/good/total counts remain finite and never create unintended rewards |
| Multipart action | Advance segments of a guild, dungeon or trial | Segment counter, cost and rewards update at boundaries |
| Story unlock | Reach a visible new story condition | Flags/text appear once as intended; story persists on reload |
| Save/reload | Save, refresh and resume | Queue, progress, options and persistent state reload correctly |
| Export/import | Export a test save and import into disposable profile | Export prefix and restored state are coherent |
| Predictor off/on | Compare predicted and actual short queue results | Predictor doesn't alter live state and forecasts remain plausible |
| Background worker | Enable background predictor and edit queue | No worker errors or permanent stale predictions |
| Challenge mode | Enter/exit a supported challenge in a test profile | Challenge overrides and original save slot behave correctly |
| Prestige | In a suitable disposable progressed save, prestige | Selected permanent buffs persist; other progression resets as designed |
| Responsive + theme | Resize viewport, switch themes, use keyboard | Controls, focus, tooltips and action bar remain usable |
| Content editor | Open `/editor.html` and load XML/schema | Editor loads independently, without affecting game state |

The test profile may not have late-game unlocks. Do not bypass unlock conditions just to claim full verification. Record what could not be exercised.

## Change-specific expectations

- **Action/balance:** cross-check cost, unlock, training, limited resources, story, queue, tooltip, predictor and late-game scaling.
- **Engine:** fractional mana, game speed, offline bonuses, pause/restart, empty queue and last-segment behavior.
- **State:** fresh saves, older saves if available, missing-field defaults, reload and challenge/prestige boundaries.
- **View/localization:** XML parsing, every new visible key, wide/narrow screens, keyboard and theme contrast.
- **Predictor:** snapshot restore and main/worker prediction parity.
- **Cloud:** never use a personal/production account; confirm only in an authorized test account.
- **Documentation:** links, catalog, claims about commands and all cross-references.

## PR evidence convention

Report **commands actually run**, manual cases actually observed, and untested risks. Include exact reproduction steps and optional anonymized/disposable fixture data for failures. Do not attach real saves or tokens. For a documentation-only PR, syntax/XML checks are adequate if no runtime behavior was changed, though browser validation remains unverified.
