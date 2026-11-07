# RW00 campaign balance tests — implementation plan

**Status:** Draft implementation plan for the campaign-pacing test work package within RW00. No tests have been implemented or benchmark durations measured by this document. This is not acceptance of the complete RW00 milestone, an approved preparation, or permission to implement or rebalance.

**Owner request:** Codex chat, 2026-11-06 (America/New_York): “Write an implementation plan for those tests”.

**Source:** step3software/outer-loops, owner-selected source branch main, freshly observed revision 11faa50c5f98d7b98d74b2d3be80d8b50c400fca. Work branch: docs/rw00-balance-routes-20261106. Shared Orcha main: b8bf6bf07073823d108fd356c48916ea0cafd615. [Structured companion](balance-tests.plan.json) contains lifecycle fields, decisions and source/document hashes. These are run evidence, not future standards pins.

## Source branch and revision for this work package

The owner's 2026-11-06 instruction is: “Update the plan to address those three gaps and use main as the source branch. Don't start building the tests yet.” Use **main** as the source and eventual review target for this work package. GitHub main was freshly observed at 11faa50c5f98d7b98d74b2d3be80d8b50c400fca, identical to this worktree's existing source commit, so this correction needs no code import, reset or rebase.

The checked-in manifest and older adapter still say dmchurch. The explicit owner selection overrides that stale branch reference for this task; it does not change shared host configuration, approvals, scheduling, writer claims or other branches. Preserve those files as observed source evidence rather than claiming they were updated. Refresh and pin main again during preparation and before any future publication; do not fall back to dmchurch. Any future automated packet must carry the explicit owner-selected source or reconcile its stale configuration before dispatch. No worker is dispatched by this plan edit.

## Outcome and boundaries

Build repeatable measurements of how long the unchanged campaign takes, where time goes, and what optional investments buy. Use the results to select whole-campaign and section budgets before a later coordinated rebalance. Keep Valley as a shorter final capstone in that future design; do not shorten it while establishing the baseline.

Owner direction is recorded in [decisions](decisions.md#owner-decisions-on-2026-11-06): option B, a campaign-wide assessment and rebalance, and baseline measurement before target durations. Route engineering below is a proposed implementation design, not an owner claim that these routes already complete.

Include two complete first-campaign routes, checkpoint accounting, paired strategy comparisons, deterministic failure reporting, browser/model comparisons and reproducible reports. Exclude changing the economy, shortening Valley, implementing the nexus or new-timeline reset, converting veteran saves, choosing the upgrade trees, and rewriting RF03/RF04. The broader [RW00 roadmap](roadmap.md) retains its other unresolved design and safety work.

## What can be reused, and what is missing

- [The model loader](../../../scripts/load-game-model.mjs) evaluates real classic scripts in a fresh Node VM. Its existing UI/storage facades are deliberately incomplete; it currently injects host clocks and has no seeded RNG or campaign runner.
- [Queue tests](../../../scripts/test-action-execution.mjs) call the real Actions.tick. [RF01](../../refactoring/rf01-evidence.md) adds synthetic progression, challenge and browser examples, not a complete timed campaign.
- [driver.js](../../../driver.js) owns executeGameTicks, timeCounter, effectiveTime, loopEnd and restart. A mana-only Actions.tick loop does not measure this clock contract. The legacy singleTick helper is not an equivalent replacement for the production driver.
- [The action definitions](../../../actionList.js), [town state](../../../town.js) and [progression map](../../audit/progression.md) own legal progression. Guides help navigation but must not override runtime behavior.
- [The browser smoke](../../../scripts/test-browser-smoke.mjs) supplies disposable Chrome/CDP patterns. Extend coverage with a dedicated balance entry point without turning it into a full automated natural playthrough claim.

## Route contract

Initial conditions: fresh loadDefaults-derived game, normal challenge mode, gameSpeed 1, no legacy prestige, no offline bonus, no nexus abilities. Preserve normal earned Chronomancy, rituals, talents, imbuements and other bonuses. Record all options, especially fractional mana and restart/repeat settings. Suppress only external scheduling, notifications, cloud and real persistence; never suppress a gameplay cost or reward.

| Route | Forward progression | Branch constraint |
| --- | --- | --- |
| R01 Valhalla | Beginnersville → Forest Path → Merchanton → Mt. Olympus → Valhalla → Startington → Jungle Path → Commerceville → Valley | Use reputation at least 51 at Judgement to avoid the known exactly-50 planner discrepancy. Earn College access, first Spatiomancy and Pyromancy 200 before Fall From Grace. |
| R02 Shadow | Beginnersville → Forest Path → Merchanton → Mt. Olympus → Startington → Jungle Path → Commerceville → Valley | Reputation at most -50 at Judgement. No forced Valhalla visit, early Spatiomancy, potion or artificial replacement benefit. |

These are guided competent-play benchmarks, not optimal speedruns or measurements of a novice's thinking time. R01 and R02 differ in available systems; their difference is not a causal estimate of reputation alone.

Implement explicit phase policies that choose legal next-loop queues using observed progress, known-good/unchecked resource modes, declared training goals and deterministic tie breaking. Both start with the same opening policy and Adventure Guild-oriented Merchanton policy where legal; Crafting is a comparison variant. Earn required mana, supplies, skills, exploration, tools, combat preparation and permanent growth. Set actual queue counts and training thresholds during route development, then freeze and hash the route version before publishing the baseline. A successful route must be demonstrated, not inferred from the travel diagram. Document any required policy revision and rerun its baseline.

Do not grant progress, fabricate resources, directly call finish to advance a campaign, invoke the predictor as the authoritative simulator, or optimize a route silently between baseline and candidate. Policies may evaluate audited pure visibility/unlock/state predicates. Do not call canStart merely to observe a checkpoint: Escape.canStart mutates escapeStarted. Let the real scheduler perform start checks. Guild membership is shared across zones within a loop and resets on restart, so schedule Explorer Guild and other mutually exclusive guild goals in compatible loops.

## UI-equivalent queue admission

Every policy-driven queue insertion, count increase, enable, replacement or replay must pass a mandatory admission adapter. The low-level Actions.addAction/addActionRecord/getNextValidAction calls do not enforce all player-facing visibility and unlock rules. Therefore executing real action code alone does not prove a route was player-accessible.

Use the real addActionToList entry point from driver.js when its UI dependencies can be faithfully supplied. If a narrow test adapter is needed instead, audit and mirror that entry point's visibility, unlock, existing-count and allowed-limit rules, travel-entry handling and resulting queue order, and compare its observable decisions against the real browser entry point. Reject unknown IDs, non-finite/invalid counts and unsupported mutations before changing the queue. Validate that the corresponding action/town is accessible to the player at the time of a new edit; preserve the game's own treatment of already-queued actions rather than inventing stricter per-tick unlock requirements.

Keep admission separate from engine start checks: temporary costs, current town, canStart and multipart progress remain the real scheduler's responsibility. Admission must not call mutating predicates such as Escape.canStart. On rejection return invalid_route with a reason, action and attempted edit; queue contents/order, resources, clocks, flags and RNG state must remain unchanged. Log admitted edits with source/policy/admission version, observed unlock evidence and the before/after queue digest so replayed earned routes retain that provenance.

Required negative cases include Buy Mana Z1 while Wander is below 20, Start Journey below its skill unlock despite holding supplies, an invisible action, duplicate/excess allowed travel entries, unknown actions and invalid counts. The locked-action case must demonstrate that the policy adapter rejects an edit the low-level API would accept. Positive cases include the same action after earning its unlock, supported count/enable edits and a retained queue replay through normal restart. Browser decisions and resulting queues must match; direct low-level enqueueing is permitted only inside clearly labeled adversarial fixtures, never a measured route.

## Gameplay UI input configuration

The balance profile needs an explicit, versioned **ui_input_config**, separate from ordinary options. Enumerate the gameplay-affecting input IDs read by the chosen execution paths. At minimum include every per-action searchToggler checkbox and every buff cap used by a route, including Ritual, Imbuement, Imbuement2, Imbuement3 and Feast. Discover any additional input dependency during the real-source audit before declaring the profile supported.

Record element ID and type, checkbox checked boolean or raw cap value string, parsed numerical cap, the corresponding buffCaps model value, and the initial source of the value. Use source-backed fresh-browser defaults: search checkboxes initially unchecked; cap values come from the actual UI/model initialization. Do not substitute permissive maximums or assume missing elements mean default settings. Provide genuine test HTMLInputElement instances for consumers that check their type. Missing, wrong-type, inconsistent or invalid required values yield unsupported_runtime or invalid configuration, not an arbitrary eligibility result. Keep old model-loader callers' defaults intact; enable this strict facade specifically for balance runs.

This matters because Town.finishRegular reads the checkbox: with known loot remaining, a missing control can consume known loot while a present unchecked control searches a new location. getBuffCap reads the DOM input rather than simply returning buffCaps. The UI and model values must be initialized and updated through the same effective semantics as a browser, including any cap synchronization required by the real UI handler. The observer cannot alter these settings to make progression pass.

Apply the same manifest to model and fresh isolated browser scenarios; read it back and compare before calibration or measurement. Every intentional setting change is a versioned policy event with before/after values and a UI-state digest; fail on unaccounted changes. Include the initial configuration hash, policy for changes and branch-point/current UI-state hashes in reports and earned-prefix replay digests. Equivalent regression comparisons require matching UI configuration and compatible setting-change policies. An intentional UI-setting experiment must be named as a treatment, not silently compared as the same configuration.

Required tests cover missing control versus explicit unchecked control, both checked states with known and unchecked loot available, cap below/at/above a purchase boundary, wrong input type, absent/invalid cap values and model/DOM mismatch. Assert rewards, search counters, eligibility, sacrifices and retained state as appropriate. A changed checkbox or cap must change the report's configuration identity; otherwise comparisons must be rejected. Synthetic input-boundary fixtures remain separate from earned campaign evidence.

## Checkpoints and side events

Record each occurrence as an event; first-hit records carry cumulative campaign time. Current thresholds below characterize the baseline, not future approved targets. Record unlock and actual completion separately. Events from different subsystems form a partial order: e.g. map bootstrap, key purchase and first Valley access need not have one universal ordering. A route declares its own ordering without making optional events prerequisites for unrelated ones.

| ID | Semantic checkpoint | Required observed subevents |
| --- | --- | --- |
| C00 | Fresh campaign | Defaults initialized; zero elapsed time and no prior completion. |
| C01 | Opening mana economy | Wander 20 unlock; first completed Buy Mana Z1 with positive gold and actual mana gain. |
| C02 | First Forest entry | Start Journey completes with earned supplies and Combat + Magic at least 35; actual town 1. |
| C03 | First Merchanton entry | Continue On completes; annotate Old Shortcut investment and travel mana. |
| C04 | First Mt. Olympus entry | First guild entry as a tagged event; City 60 and successful Start Trek into town 3. |
| C05 | Judgement resolved | Mountain 100; completed Judgement and actual destination, reputation and story outcome. |
| C06 | Valhalla training and departure | R01: College entry, first Spatiomancy, Pyromancy 200 and completed Fall From Grace. R02: explicit not-applicable, not zero elapsed time. |
| C07 | First Jungle entry | Startington arrival, Meander 100, supplies and completed Journey Forth. |
| C08 | First Commerceville entry | Explore Jungle 100 and completed Escape; record effectiveTime at engine start and missed windows. |
| C09 | Exploration bootstrap | Explorer Guild entry, positive global survey progress, first completed map and first map turn-in as separate events. |
| C10 | First Valley entry | Key actually bought for one million gold, then consumed by completed Leave City. |
| C11 | Stone chain operational | Source-specific Survey 100 and ruins access; first successful stone acquisition and delivery. Track origins 1, 3, 5, 6 separately. |
| C12 | Tower progression | First contribution, then 25%, 50%, 75%, 100% of the pinned build's completion requirement; baseline level 100 requires 1,000 contributions. |
| C13 | Divine power progression | First Gods Trial floor; floors 10, 25, 50, 75 and 100; first power; subsequent Challenge Gods power increments through eight. Observe current-loop and persistent counters separately. |
| C14 | Restore Time | First engine-admitted start and first successful completion with actual completion flag transition. Admission alone does not prove enough remaining loop budget to finish. |

Also tag first/each skill threshold used by a route, dungeon floors, ritual/imbuement purchases and sacrifices, gold-to-mana conversions, farming, queue failures, early restarts, backtracks and unlocks of legal shortcuts. A side event can occur between several main checkpoints. Track required but currently impossible events as blocked, not fabricated.

## Clock and simulation design

1. Add optional test-only dependency injection to the existing loader for an isolated Math/RNG object, Date, performance, scheduling facade, strict gameplay UI input profile and in-memory storage. Existing callers retain their defaults and existing tests must remain unchanged in meaning. Fresh VM per scenario prevents leaked challenge overrides, caches and globals.
2. Drive the original executeGameTicks, Actions.tick, loopEnd, prepareRestart and restart. Disable the real asynchronous timer loop, advance a recorded virtual wall clock and feed gameTicksLeft. Begin with 20 ms quanta. Do not copy timing formulas into a second engine or replace progress with analytical estimates.
3. Keep the engine's performance/deadline clock deterministic and finite, and a separate real host watchdog. Never make performance.now constant inside an unbounded engine loop. Treat deadline-driven lag refunds or artificial offline credit as an invalid ordinary baseline with diagnostics; do not hide them by clearing balances. Increase batching only after small-quantum equivalence checks show the same semantic events and state within stated floating-point tolerances. Record the batching policy.
4. Capture semantic events through delegating test observers around real execution; observers cannot add rewards, change eligibility or call extra mutating predicates. Flush events after the driver accounts for spent time. If sampling rounds timestamps to a quantum, report that maximum error; do not present sub-quantum precision as exact.
5. Carry clocks across loop resets exactly once. At stable post-step boundaries, reconcile campaign totals against totals.time plus the active loop's timeCounter and equivalent effective-time accounting. loopEnd folds active counters into totals before restart clears them: avoid counting both during that transient window. Negative controls must detect a missed final loop and a double-counted loop.
6. Distinguish gameplay waiting seconds, in-world effective seconds, mana expenditure, loop count and real host execution seconds. Pauses and human decision time are excluded and labeled; neither test CPU time nor mana divided by 50 is a campaign-duration result.

Use versioned xorshift32 with nonzero seeds 1, 42 and 20261106 for the first full sample set. Document the uint32 algorithm and random-call counts; never mutate process-global Math. Repeat seed 42 twice as a reproducibility check. Paired alternatives start from the same earned state and initial RNG state, but later random calls may diverge; report that rather than claiming identical stochastic outcomes. Report every seed, median and range, including failures. Three seeds are an initial engineering sample, not a statistical population estimate.

## Early browser calibration gate

After the harness, admission adapter and UI input profile exist, run a short calibration against a new isolated Chrome profile **before developing the C00-C08 policies, full campaigns or strategy comparisons**. A minimal earned opening queue may be built solely for this calibration. Keep step 6 for wider boundary coverage; it does not replace this early gate.

Compare the real browser queue-entry path with the adapter, then compare real driver/action execution under a recorded matched clock schedule. Include opening action time and mana, an earned speed change, a normal loop restart, locked/unlocked admission, limited-resource search under both checkbox states, and cap-dependent action behavior. Use synthetic cap-boundary fixtures where necessary and label them. Check action counts, queue results, progress, clocks, flags, rewards, search counters and retained state; calibrating two equally mocked facades is insufficient. The browser case must use real rendered controls and player-facing admission. Ordinary source assertions, such as zero reward from a newly searched non-reward location, provide independent negative controls.

Record exact discrete outcomes, independently justified floating-point tolerances and timestamp sampling bounds before marking a scenario passed. Deliberately change one facade checkbox/cap or bypass one admission guard and demonstrate that calibration fails. Reconcile clock totals independently with a known short action/loop example. Only after calibration passes may the fast runner rely on the facade for long earned runs.

Produce a bounded calibration report containing pass/fail, required scenario coverage, browser version, source and relevant game/adapter/UI code hashes, clock/scheduler configuration, admission version and UI configuration hash. The full-measurement runner requires a successful matching report. Missing/failed calibration or unavailable Chrome blocks official full measurements and returns a nonzero incomplete/unsupported result; it never silently skips the gate. Any exploratory uncalibrated diagnostics must be clearly labeled and cannot become a baseline. Changes to relevant game, adapter, admission, clock or UI inputs invalidate the report and require recalibration. This is verification evidence, not a new authority ledger or stage approval.

## Optional investment comparisons

| Comparison | Start and endpoint | Required interpretation |
| --- | --- | --- |
| Adventure vs Crafting | Same earned Merchanton checkpoint before guild choice; compare next shared checkpoint and campaign completion. | Respect within-loop guild exclusion; include setup, armor/team effects and retraining. |
| Potion/Totem vs skip | Same R01 earned state with legal College/Spatiomancy access; compare first use, later training and completion. | Include Alchemy, herbs, travel and the consumed potion. Do not grant R02 inaccessible skills. |
| Invest/Collect Interest vs immediate earnings | Same earned Commerceville state and capital; compare key purchase and completion. | Fix alternate earnings policy, include capital opportunity cost, investment time and interest-action counts. |
| Earned shortcuts vs ordinary travel | Same earned state before a shortcut's acquisition decision; compare unlock cost, repeated travel and completion. | A shortcut already owned at the split measures use benefit only; measure acquisition separately. |
| Rituals/imbuements vs defer | Same earned pre-purchase state; each named upgrade has a fixed target and defer comparator. | Include soulstones, talent/stat sacrifice, return travel and later savings. No blanket “all upgrades” fixture. |

Store route recipes and deterministic event replay references, not exported player saves. Reconstruct a branch point by replaying its earned prefix in a fresh VM and checking a canonical state digest. Only introduce an optimized in-memory checkpoint restore after proving restore/replay equivalence, including globals, RNG, queue/admission provenance, UI input configuration/state, clocks and prototypes; existing predictor snapshots and doSave alone do not establish that contract. Synthetic high-level fixtures are allowed for isolated correctness/browser checks and must never be counted as earned whole-campaign evidence.

## Result and failure contract

Emit a versioned JSON report plus a Markdown summary. Include source and relevant file hashes; dirty-tree fingerprint if allowed for development runs; route/policy/admission/checkpoint/PRNG versions and hashes; seed; options; UI input configuration and state hashes; matching early-calibration report identity; platform/Node/browser; scheduler configuration; start and endpoint IDs; per-checkpoint metrics; zone/action attribution; repetitions/failures; status and coverage limitations. Official baselines require a clean, pinned candidate or an explicitly hashed patch candidate; never label unrelated dirty work a release baseline.

Overall statuses: complete, stalled, budget_exceeded, invalid_route, unsupported_runtime and error. Any failed required seed or comparison makes the baseline incomplete; preserve diagnostic output and return nonzero. A budget stop reports last checkpoint and pending goal, not an extrapolated finish time. Initial safety limits are 30 host minutes per route/seed, 180 simulated gameplay days and 10,000 consecutive loops without a declared progress measure advancing. These configurable technical ceilings are not pacing targets. They must be visible before execution and never silently raised. Monitor meaningful skill/resource/progression deltas during long farming so it is not falsely called stalled; a hard ceiling remains independent of that progress detector.

Publish separate views of time by progression interval and by action location. In the interval view every charged duration belongs to one interval; in the location view every duration belongs to one location/category. Never sum the two views. Include the cost of earlier-zone stone farming in the relevant endgame interval. Optional side-event durations can overlap intervals and are annotated, not added again. Show first unlock, first attempt and first success independently.

Compatibility checks must separate comparable pacing deltas from strategy changes. Baseline/candidate comparisons require matching route, scenario, options, UI input configuration/change policy, seed, admission, checkpoint and scheduler versions, plus valid corresponding calibration evidence; changed source revisions are expected and named. Route-version changes require a separately regenerated baseline. Before owner budgets exist, duration changes are observations; correctness and report integrity are pass/fail. The later owner-approved whole-campaign and section budgets become a separate, versioned target artifact. Do not freeze today's grind as the desired timing contract.

## Implementation sequence and proposed file map

These are proposed files for subsequent preparation; this document grants no file-level implementation authorization. Keep production game files read-only. If fidelity requires changing their behavior or exposing a new game API, report the specific seam and obtain revised scope rather than silently refactoring.

| Step | Proposed files/operations | Proof before continuing |
| --- | --- | --- |
| 1. Harness, admission and inputs | Modify scripts/load-game-model.mjs narrowly; add scripts/balance/engine.mjs, admission.mjs, ui-inputs.mjs and scripts/test-balance-contracts.mjs. | Original queue/clock behavior retained; mandatory UI-equivalent edit guards; typed, explicit UI input state; rejection has no side effects; finite zero-progress and fractional-mana cases. |
| 2. Early browser calibration | Add scripts/test-balance-browser.mjs and a bounded calibration-report reader/writer shared with scripts/balance/engine.mjs. | Real rendered-control and admission comparisons; short driver/clock/restart checks; search/cap boundary checks; deliberate facade mismatch fails. No long-route measurement or C00-C08 policy work proceeds without a passing matching report. |
| 3. Events and policies | Add scripts/balance/checkpoints.mjs, policies.mjs and fixtures.mjs. | C00-C08 earned prefix runs for both routes; all edits pass admission; UI-state and edit provenance captured; no extra Escape predicates or guild conflicts. |
| 4. Full routes | Extend policies.mjs and fixtures.mjs through C14; add scripts/measure-balance.mjs. | Matching calibration gate enforced; both routes reach map/stone/tower/trial completion with all progress earned; blocked runs remain incomplete diagnostics. |
| 5. Measurements and comparisons | Add scripts/balance/metrics.mjs and report.mjs; comparison scenarios stay in policies.mjs. | Matched earned-prefix/UI-state reconstruction; five strategy comparisons; configuration/calibration mismatches and deliberately corrupted reports rejected. |
| 6. Wider browser fidelity | Extend scripts/test-balance-browser.mjs using the same strict inputs, admission and scenario recipes. | Judgement/Escape/endgame boundaries, save/reload and reward idempotency; synthetic late fixtures explicitly labeled. Rerun early calibration after relevant changes. |
| 7. Commands, CI and evidence | Modify package.json, .github/workflows/validate.yml, .gitignore and docs/development/validation.md; update this plan's verification section with actual evidence. | Fast contract suite in PR CI; reproducible early calibration plus bounded, gated full CLI; generated .balance-results ignored; no raw saves or large traces committed. |

Retain the scope as one campaign-pacing package. Steps are review checkpoints, not new portfolio milestones or permission to rebalance a region early. Prefer a focused test-only PR with reviewable commits; do not combine it with gameplay tuning.

## Verification matrix

| Test family | Required assertions |
| --- | --- |
| Clock and resets | First action time, earned speed changes, multiple loops, empty queue, failure, pause/resume, fractional mana, leftover frame budget, final active loop and bounded simulation. |
| Queue admission | Locked/invisible actions, wrong/unknown IDs, invalid counts and allowed-limit edits are rejected without mutating queue, resources, clocks, flags or RNG; matched real-browser positive cases and retained queue replay. |
| UI input configuration | Both search-toggle states, typed cap inputs, model/DOM synchronization, missing/invalid inputs, setting-change provenance, fingerprint changes and mismatch rejection. |
| Early calibration gate | Missing, failed, stale or configuration-mismatched calibration prevents a passing full measurement; intentional guard/facade mutations fail the short real-browser comparison. |
| RNG/isolation | Same seed reproduces; other VM does not share RNG/storage/cache/function overrides; seed/configuration present in report. |
| Judgement | At -51/-50/-49/49/50/51, compare actual town, unlock/story flags and planner prediction. Current finish uses at least 50 for Valhalla, at most -50 for Startington, otherwise no movement; planner predicts Startington at exactly 50. Characterize as an explicit known discrepancy with issue context, never silently repair it in test work. |
| Escape | 59.99, 60 and after; first eligibility side effect, already-started state, actual start versus completion and missed window. Clock injection must not bypass this gate. |
| Progression | Costs/resources finite, exact guild exclusivity, map bootstrap, all stone origins/caps, tower quarter points, terminal trial rewards, eight power and one completion award. |
| Side-by-side strategies | Same earned prefix; setup cost included; explicit skipped/infeasible cases; downstream checkpoint and final completion measured. |
| Reporter sensitivity | Missing source/seed, changed UI config/admission/calibration or policy, duplicate/out-of-order impossible events, absent C14, double-counted intervals, non-finite duration and failed seeds cannot become a passing baseline. |
| Browser comparison | Matched short scenarios compare actual action counts, mana, town progress, clocks, resets and flags; later synthetic fixtures do not prove whole-route browser completion. Document numerical tolerance and timestamp sampling bounds explicitly. |

**Proposed commands — not installed yet:**

~~~sh
npm run test:balance
npm run test:balance:browser -- --phase calibration --output .balance-results/calibration.json
npm run measure:balance -- --route R01 --seed 42 --calibration .balance-results/calibration.json --output .balance-results/r01-42.json
npm run measure:balance -- --all --calibration .balance-results/calibration.json --output-dir .balance-results
npm run test:balance:browser -- --phase boundaries
~~~

PR CI should run the deterministic contract suite with a two-minute job-step limit. Early calibration is mandatory before the full-measurement CLI can produce a successful baseline. Full multi-seed campaign measurements use the explicit CLI and per-run limits above, outside the ordinary PR fast path until measured execution cost justifies promotion. Do not pretend a short route prefix is a full campaign result. Existing check/model/action/RF01/mechanics/XML/browser commands remain required for the later code delivery; the current plan-only edit needs documentation checks and XML validation.

## Acceptance criteria

- **BT01** — A controlled-clock adapter executes the real action, driver, loop-end and restart paths; no gameplay formula or reward path is reimplemented.
- **BT02** — Gameplay waiting seconds, effective seconds, mana spent, loop count and host execution seconds are distinct, monotonic across restarts and reconciled without double counting.
- **BT03** — R01 Valhalla and R02 Shadow each reach C14 from fresh defaults with earned progress, mandatory UI-equivalent queue admission and a frozen versioned legal policy; partial or stalled runs are not successful baselines.
- **BT04** — C00-C14 and tagged support events are recorded from observed execution, with repeatable event ordering, source identity, route hash and RNG metadata.
- **BT05** — Guild, potion/Totem, investment, shortcuts and rituals/imbuements have matched-state comparison scenarios reporting setup cost and downstream payoff; infeasible scenarios are explicitly reported.
- **BT06** — Repeated seed/configuration runs reproduce semantic traces; a fixed seed set reports individual results, median and range without dropping failures.
- **BT07** — Short real-browser admission/input/clock calibration passes before long routes; wider browser/model comparisons later cover Judgement, Escape, save/reload and endgame reward boundaries, with synthetic fixtures labeled.
- **BT08** — Timeout, stall, illegal queue, non-finite state, unexpected offline credit and unsupported adapter behavior produce typed failures with last checkpoint and diagnostics.
- **BT09** — Reporter tests reject incomparable policy, UI input, admission, calibration or runtime configurations, double-counted time, false checkpoints and incomplete baselines; no target gameplay duration is invented.
- **BT10** — Existing repository checks remain green; fast contract checks enter PR CI and full measurements have explicit host-time and simulated-time budgets.
- **BT11** — No production game, save format, player profile, balance number, challenge rule or outer-loop feature is changed by the test-only delivery.
- **BT12** — An unchanged-campaign baseline report maps every criterion to evidence and states coverage gaps; owner pacing targets and the coordinated rebalance remain later work.

- **BT13** — Every policy queue mutation or replay has UI-equivalent admission provenance; locked/invisible/invalid/over-limit edits fail without state changes, and positive cases match the real browser.
- **BT14** — Gameplay-affecting DOM inputs, raw/parsed cap values, corresponding model values and setting changes are explicit, typed, source-backed, fingerprinted and matched across model, browser, replay and reports.
- **BT15** — Official full measurements require matching successful early-calibration evidence; missing, failed, stale or incompatible calibration blocks success, and deliberate admission/facade faults are detected.

## Dependencies, risks and later decisions

- RF01's existing loader, queue and synthetic/browser evidence is reused; it is not restarted as a milestone. Missing campaign/clock coverage is added here.
- RF02 is not required to measure synthetic in-memory progression or isolated test profiles. It remains a hard gate before later player-facing reset, recovery or migration. RF03/RF04 fixes are not assumed installed.
- The small-quantum real driver may be expensive for the current campaign. Instrument overhead and batching fidelity first. An over-budget result is useful diagnosis, not permission to approximate a claimed completion.
- Route policy choice can dominate results. Freeze it, expose it and compare alternatives before calling an effect a balance problem. No baseline is advertised as an optimal route.
- DOM-dependent cap/search behavior is part of the strict UI input profile and early browser calibration. Missing or mismatched controls block the calibration rather than silently changing rewards. Do not remove caps, alter formulas or return permissive eligibility to make a route finish.
- Judgement planner mismatch, Gods Trial predictor mismatch and mutating Escape eligibility require visible characterization. A reproduction does not authorize fixing them in this work package.
- The new-timeline reset, upgrade choices, retained progress and speed stacking remain undecided. A test-only 10x sensitivity scenario may follow baseline measurement, clearly labeled; it is not proof of the eventual Real World replay experience. No 10x setting is written to production.

No new owner answer is needed to draft or refine this baseline test design. After a trustworthy baseline exists, the owner chooses whole-campaign duration, section pacing, acceptable repetition and optional-investment payoff. Existing other RW00 decisions remain with their canonical owners; they do not block isolated baseline measurement or become accepted by this plan.

## Documentation organization and continuation

Navigation is roadmap → this implementation plan → structured companion and exact source owners. The decision ledger remains the owner-answer record; no new status ledger or accepted lifecycle receipt is created. The plan repairs the stale “C recommended, no ending selected” summaries in the design index and roadmap while preserving the historical alternatives study. Source audit findings remain as-coded evidence. Coverage here is substantive for the loader, driver/queue timing, action gates, route guides and related contracts, selective for browser/predictor internals, and not an exhaustive gameplay/security audit.

**Next stage:** Review and accept this bounded plan, then prepare the exact file operations and tests against a refreshed, owner-selected main source. Subsequent implementation needs its own grant. Preserve branch writer protection and human merge/release gates. Rebalance all sections together only after measurement and owner budgets.

## Review corrections in this revision

| Finding | Plan correction | Required future proof |
| --- | --- | --- |
| P1: low-level queues can bypass UI unlocks | Mandatory UI-equivalent admission adapter, recorded edit provenance and side-effect-free rejection; BT03/BT13. | Locked Buy Mana/Start Journey, invisible/unknown/over-limit/invalid edits fail; actual browser admission and valid replay agree. |
| P1: gameplay DOM inputs were not explicit | Versioned typed UI input manifest, source defaults, cap model/DOM agreement, setting-change events and comparison hashes; BT09/BT14. | Missing versus unchecked search control changes the adversarial fixture as expected; matched controls agree; mismatched controls/caps cannot be comparable runs. |
| P2: browser calibration came after long runs | Step 2 is now a mandatory short calibration before long-route policy development, full runs or comparisons; broader checks remain at step 6; BT07/BT15. | Missing/failed/stale calibration blocks measurement success; deliberately bad admission/facade behavior fails calibration. |
| Source branch conflict | Owner explicitly selected main on 2026-11-06; fresh main observation matches the existing source commit. | Preparation refreshes main and carries the owner source selection; no silent fallback or unrequested host/config rewrite. |

These corrections specify future tests and gates only. No test, runner, facade, CI command or gameplay code was built or executed as part of this revision. Plan acceptance, preparation acceptance and implementation authorization remain absent.

## Verification of this documentation change

Revision 2 documentation validation passed on 2026-11-06: npm run check (39 JS files, 92 Markdown files / 698 links, 48 local scripts, 157 actions), five XML/Relax NG files, plan-local links and heading anchors, 15 criteria and seven-step consistency, review-correction coverage, unchanged adjacent edits, current-main standards hashes and git diff --check. main was freshly observed at the unchanged source revision; the explicit owner source selection is retained. These are documentation/static integrity checks, not proof of the proposed runtime gates. Only the two plan artifacts were edited in this revision; no tests, runner, facade, gameplay or CI implementation was started. The plan remains a draft with null plan approval and implementation authorization. The owner authorized publishing these five documentation files as a draft PR against main; actual publication is established by the Git commit and PR, not by this status sentence.
