# Verification and regression matrix

## Automated baseline

From the repository root:

```sh
npm run check
npm run test:model
npm run test:action
npm run test:rf01:model
npm run test:rf01:challenges
npm run test:rf02:preflight
npm run test:rf02:transaction
npm run test:rf03:model
npm run check:mechanics
python scripts/check-xml.py
npm run test:browser
```

`npm run check` verifies syntax for first-party `.js` / `.mjs` files (including validator scripts), relative Markdown file links, known entry-point assets and consistency of the documented `Action.*` inventory. The worker-like model test initializes real game code and checks action registry/formulas. The queued-action test executes an opening Wander in the real queue engine with a no-op UI facade. Generated mechanics must match all live action definitions. These do not replace browser testing. The Python script checks that the checked-in `.xml` and `.rng` files parse as XML. `npm run test:browser` starts a local HTTP server and disposable Chrome profile to boot the real game, execute Wander and verify the browser save survives reload; it requires installed Chrome/Chromium. The PR workflow runs these checks automatically.

**Since the merged RF01 implementation (PR #4)** the browser smoke additionally tests synthesized current/legacy imports and aliases, a recoverable reproduction of invalid-import overwrite risk R01, actual foreground/Web Worker Wander prediction parity, all three original challenge slot transitions, and a synthetic original prestige reset. The [RF01 evidence ledger](../refactoring/rf01-evidence.md) describes exactly what was run. [RF02's readiness brief](../refactoring/rf02-readiness.md) and [P01–P22 test matrix](../refactoring/rf02-test-matrix.md) define the required recovery tests. [RF02 PR #16](https://github.com/step3software/outer-loops/pull/16) is merged and adds Node and browser persistence/recovery tests; do not infer complete real historical-save coverage from synthetic checks. **Authentic historical save fixtures, an end-to-end playthrough, broad predictor parity, offline/fractional-tick stress and UI/accessibility audits are not yet covered.** A green static check alone is not a gameplay test.

## RF03 gameplay rules and resources

`npm run test:rf03:model` runs synthetic source-backed, DOM-less checks for authoritative buff caps and snapshots, pure Escape eligibility, first positive mana-spending activation, all 18 numeric/nine boolean resources, nonfinite-result rejection and stable loop-reset references. `npm run test:browser` also checks edited cap inputs, rejected blank edits, save/reload and a real DOM-less Worker imported from classic game scripts. The existing RF01 Escape/R04 assertions now require the corrected behavior; R15 Gods Trial parity is unchanged.

The separate [RF03 evidence ledger](../refactoring/rf03-evidence.md) records which checks actually ran. A successful isolated V8 model evaluation does **not** establish that Node, real Chrome, the complete worker predictor or full CI checks have run.

## Documentation and Orcha integration

For documentation-only changes, run `npm run check` and XML validation when
Python is available; runtime-model and browser suites are not required for prose
or manifest-only edits. The repository check validates local link targets but
does not validate heading anchors or fetch cross-repository links: inspect those
against the actual referenced documents.

When `.orcha/repository.json` or the instruction chain changes, also run the
[portable Orcha check](ai-workflow.md#local-implementation-and-verification)
against current verified main and resolve the affected task/nested paths.
Record the exact main revision and hashes. Verify `main` source policy,
legacy authority, local contract paths and preservation of existing milestone
IDs/approval history. Do not infer scheduler admission or installed host adoption
from manifest validity. No gameplay, save or worker behavior is verified by these
documentation checks.

## RW00 campaign balance and accelerated scheduler (partial)

`npm run test:balance` is the bounded pull-request suite. It exercises test-only deterministic VM clocks and RNG, UI-equivalent queue admission, typed/hashed gameplay UI settings, synthetic Judgement/Escape/search/cap boundaries, short original-driver execution, reference-versus-accelerated semantic equivalence, fail-closed acceleration eligibility, and an independent process watchdog. The watchdog test terminates synchronous infinite loops and uncooperative workers exceeding an independently sampled operating-system resident-memory ceiling, with heartbeat-based heap checks retained as an additional signal. The suite is source-backed but is not proof of a real earned campaign.

`npm run test:balance:equivalence` runs the reference and accelerated adapters from fresh, identical VMs for opening progression, normal training, limited resources, loop exhaustion and fractional mana. Exact state is required except for the named continuous fields and `1e-9` tolerances exported by `scripts/balance/calibration.mjs`. Unknown or unverified actions use 20 ms precision mode, and batches cannot cross a calibrated action/talent boundary. Accelerated mode refuses to start without a versioned calibration manifest; earned runs additionally require matching complete real-browser calibration evidence.

`npm run test:balance:performance` (also exposed as `npm run profile:balance`) runs a bounded 120-second synthetic Wander workload. It requires equivalent semantic state and at least 100 times fewer outer scheduling calls. Its aggregate report separates host milliseconds, simulated seconds, engine time, observer/serialization time, VM evaluations, internal action ticks, batch distribution, precision fallbacks and peak heap. This synthetic workload is performance evidence only, not earned campaign evidence or a campaign-duration estimate.

`npm run test:balance:browser -- --phase calibration --output .balance-results/calibration.json` requires Chrome/Chromium and a disposable local profile. It checks the real browser's queue admission, input defaults, limited-resource search/caps and a short driver schedule against both reference and accelerated model execution. Deliberate checkbox, cap, RNG, clock and offline-credit mismatches must be detected. Missing or failing Chrome is a failure, not a skip. This command remains outside ordinary CI.

`npm run test:balance:potion` checks the versioned R01 potion policy phases, its direct-state-mutation guard, calculated skill/progress requirements, and explicitly synthetic late-game checkpoints. The synthetic fixtures inject prerequisite persistent progress and temporary resources, then execute the unchanged production actions along the direct route: `Start Journey` → `Continue On` → `Start Trek` → `Looping Potion` → `Face Judgement` → `Fall From Grace` → `Purchase Supplies` → `Journey Forth` → `Totem`. They require potion retention at the craft endpoint, potion consumption plus Wunderkind at the Totem endpoint, and prove that Survey, Restoration and Open Portal are absent from the route. The injected endpoint fixtures run with an explicitly synthetic 5,000× game-speed setting using reference 20 ms driver steps; they provide fast endpoint coverage and a rough cost estimate, not earned campaign timings or acceleration calibration. The command also checks fail-closed calibration matching, incomplete-run evidence, corrupted report/prefix rejection, repeat action-completion witnesses across loops, same-loop potion craft/Totem evidence, high-speed event timestamps, legal capacity growth and the earned Imbue Mind prerequisite to Meander.

The calculation divides the direct route into nine coherent real-time sections: foundations and Forest mastery; three Alchemy/herb bands; Mt. Olympus and three Pyromancy/Valhalla bands; Wizard College through the first Jungle expedition; and the final Totem unlock plus potion carry. Counts, progress gains, mana costs, stat-adjusted ticks, skill XP curves, multipart costs/progress, base mana per second and the first earned Wizard College reduction are read or exercised from the loaded production game code. Representative stat levels, Wizard College segment 3 and Imbuement 100 are explicit scenario assumptions. The current calculation is about **29.23 real-time days** total; individual sections range from about **1.84 to 4.54 days**, with a longest/shortest ratio of **2.46**. Tests allow five to ten sections and require the longest to remain no more than three times the shortest so coherent boundaries can remain more important than exact equality.

The estimate includes known-good herbs needed by Alchemy and the final potion, the deterministic gold/reputation plan for the carry loop, artifacts converted into College gold/favors, positive Judgement, one production-formula Wizard College completion, Startington progress, Jungle level 50 and the final craft/consumption actions. It excludes discovery failures, repeated-loop travel and mana-economy overhead. It is therefore a source-backed planning estimate rather than a technically exact campaign simulation.

`npm run test:balance:campaign` extends the same calculation method through the remaining original campaign checkpoints C08–C14. It covers Jungle 50–100 and Escape, Commerceville Explorer bootstrap, a source-derived Thieves route to the one-million-gold key, Leave City, Survey/Ruins/stone chains for origins 1/3/5/6, all 1,000 tower contributions, Gods Trial floors 1–100, all seven Challenge Gods powers and `Restore Time`. The ordinary `npm run test:balance` suite now includes both the potion and remaining-campaign calculation tests. The generated [calculated timing baseline](../design/outer-loop/calculated-timing-baseline.md) records every section and links each calculator and test; `npm run check:balance:timing` rejects documentation drift and `npm run write:balance:timing` regenerates it.

With the current explicit assumptions, the calculated remainder after the Totem is about **2,425.77 real-time days**, and the full path from a fresh campaign through `Restore Time` is about **2,455.00 days / 6.72 years**. The largest costs are the exponential final Gods Trial floors and Challenge Gods: floors 91–100 account for about 1,623.62 days, while Challenge Gods plus `Restore Time` account for about 303.26 days. The four Survey/Ruins/stone/tower quarters contribute about 352.30 days. These figures apply representative stat levels plus injected late combat skills, Feast/Imbuement buffs, party, armor, Thieves rank and known-good limited resources. Discovery failures, repeated-loop route/economy overhead and the acquisition cost of those late assumptions remain outside the totals, so this is a planning model rather than an earned baseline.

The campaign test also records the current low-reputation route as **blocked for potion access**: Alchemy 200 unlocks `Looping Potion`, but without Valhalla's Spatiomancy the action remains invisible. It does not fabricate a shadow-route duration. Optional Adventure/Crafting, investment, shortcut and ritual comparisons remain separate scenarios and are not added to the mandatory-route total.

Explicit earned diagnostics remain available through `npm run measure:balance -- --route R01 --endpoint potion-craft --seed 42 --mode accelerated --max-host-seconds 35 --calibration .balance-results/potion-calibration.json --output .balance-results/r01-potion-42.json`; `--endpoints potion-craft,potion-totem --all-seeds --max-host-seconds 300` selects the bounded batch. Output is rejected unless it remains beneath `.balance-results/`. These commands are explicit and do not run in ordinary pull-request CI. Each seed/endpoint runs inside a separately supervised worker with an independent host deadline and operating-system RSS sampling on Linux, macOS and Windows; heartbeat heap reporting is supplemental, not the enforcement boundary. Monitoring failures fail closed. A terminated worker yields an incomplete report, never a certified baseline.

The injected endpoint fixtures pass through unchanged production action implementations for direct travel, potion creation and Totem consumption. Calculated section time is reported separately from the synthetic tail execution time. The 64-loop adapter reuses the guarded scheduler for every action batch, with unverified actions falling back to precision steps; the test compares its persistent state and RNG evidence against ordinary restart stepping. Action completion events are no longer deduplicated by action name, report transient craft events from the original engine, and record separate wall/effective timestamps. Earned resource insufficiency triggers exploration/skill-growth policies before an explicit exhaustion diagnosis, and zero-Imbuement Meander is not counted as progress. A disposable Chrome 156.0.8078.80 calibration passed 12 browser/model cases. No complete fresh earned potion craft or Totem run has passed, so synthetic results and timed-out earned reports are not baselines.

This run refreshed shared instructions at Orcha `b8bf6bf07073823d108fd356c48916ea0cafd615` using blobs: `AGENTS.md` `bb6f8c7efbe07383736ba6d02939bb557607b904`, intent routing `7444576390bcf93566aa207b7985ed1277b65a33`, implementation workflow `fc18fbcb6f8f380f3681159cd03d139429220124`, development workflow `ab5e4ecd2a34efd8944cb77faa58f103b77a69b5`, coordination `e30ec4eb7f50441565d8ea5b466908b6c4049bf3`, standards catalog `1a454e3a1dfb2707a95b8d18e4b11b098a0b4023`, repository registry `e91edec4d7c53966f0880991dcc9fe7af1a1463e`, and Orcha README `4a7b7c7b9977902c2c7bf38fe4550811d218b7ce`.

**Unverified / incomplete:** fresh earned potion craft and Totem endpoints, fresh earned-prefix digest replay, seed-42 repeat evidence, full earned R01/R02 C00–C14 policies, five paired strategy comparisons, wider late-game browser parity and successful official campaign baselines. The C00–C14 calculations are source-backed planning estimates, not earned simulations. No partial or synthetic run is certified as an official baseline. Tests use synthetic fixtures where labeled; no real saves or gameplay balances are changed. The [RW00 plan](../design/outer-loop/balance-tests-implementation-plan.md) contains the wider acceptance criteria.

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

## RF02–RF04 correction verification

`npm run test:rf02:preflight` exercises the save-option type-drift regression;
`npm run test:rf02:transaction` retains exact stored bytes while exercising legacy
numeric-text `updateRate` and quota/rollback faults. `npm run test:browser` runs
the complete disposable-profile smoke suite, including recovery of both slots
after explicit clear, challenge/prestige transitions and the real predictor Worker.
RF04's branch also requires `npm run test:rf04:model` and its additional browser
policy/identity assertions. Passing these checks is candidate evidence, not
milestone acceptance or a deployment observation.

Both browser harnesses share installed Chrome/Chromium discovery. Windows uses
an installed executable followed by a real CDP boot; other platforms retain the
command/version probe. Expected blocking alerts are dismissed in the smoke
suite; confirmations and all returned-value/storage assertions remain explicit.
Profiles are temporary and cleanup targets only the owned browser process tree.

The balance profiler only records telemetry and preserves original errors;
`BalanceEngine.step` enforces the declared execution ceiling from `start()`, and
the independent parent supervisor covers process startup, elapsed time and RSS.
The supervisor suite separately proves a silent startup deadline, an active
infinite-loop deadline, cooperative memory failure and independently sampled
resident-memory failure. Windows samples the owned PID using `tasklist`.

`npm run test:balance:source` verifies that LF/CRLF materializations produce the
same complete calibration source fingerprint and that actual source edits still
invalidate it. Generated timing/mechanics checks normalize Markdown line endings
only; source or numerical changes still require regeneration and review. Run the
unchanged full equivalence scenarios to completion; a caller's short timeout is
not a passing result. Potion event fixtures use labeled synthetic progression
to fit repeated actions within the real starting mana budget. These fixtures do
not establish an earned campaign or official RW00 baseline.
