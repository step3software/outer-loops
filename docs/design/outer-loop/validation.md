# Real World — future tests, playtests and acceptance questions

**Status:** Prospective tests and questions. Nothing in this file is evidence that Real World is implemented or playtested. Existing baseline tests are documented under [audit coverage](../../audit/coverage.md).

## What must feel different

After playing a substantial original campaign, the player should be able to answer **yes** to:

1. "Drinking the Looping Potion deliberately brought me to a changed Beginnersville, independent of finishing Valley."
2. "I saw several alternate selves, and one noticed I was new and talked to me."
3. "The new village was familiar but strange, and I could explore before choosing a rerun."
4. "Potion entry did not destroy my unfinished or completed original-world timeline, including Valley progress."
5. "My first rerun granted visible **skill points** and a **big temporary boost** beyond permanently free **~10× speed**."
6. "I could still make a meaningful permanent choice that changed what I **planned or automated**, not merely how long I waited."
7. "There is one clearly understandable permanent progression system—not both the legacy Prestige Perks menu and a new shop."
8. "New systems appeared gradually, with a reason to replay now and an eventual path to parties."

If the response to 5 or 6 is no, the first vertical slice is not ready merely because the pixel art looks good.

## Implementation regression matrix (planned)

| ID | Scenario | Required result / invariant | Related source/risk |
| --- | --- | --- | --- |
| N01 | Fresh save with no legitimate potion access | Real World unavailable; original world, nine zones and Valley progression unchanged | `Action.LoopingPotion`, `saving.js` |
| N02 | First valid deliberate **potion drink** for Real World | Enter separate alternate Beginnersville, record first arrival once; no `RestoreTime` prerequisite or legacy reward | New entry boundary, `Action.LoopingPotion` |
| N03 | First entry, refresh and repeat drink/entry | No duplicate village/guide introduction, reward or forced reset; first-entry receipt idempotent | `saving.js` |
| N04 | Enter/leave Real World with **unfinished Valley** | Original progress stays intact and recoverable; return/inspection obeys approved policy | Outer/timeline save lifetime |
| N05 | Explicit Start New Timeline | Timeline-only state resets; outer village/selves/entitlements remain; skill-point/boost grants once | RF02, new timeline transaction |
| N06 | Equivalent queue before/after replay acceleration | Around 10× wall-clock throughput where not CPU limited; same logical action costs, stat XP per action, progress and mana budget | `driver.js` `gameSpeed` / `getSpeedMult` |
| N07 | Time-sensitive gates and speed | `Escape` behavior at 59.9/60.0/60.1 effective sec preserved; no paradox introduced by raw throughput boost | `Action.Escape.canStart`, RF03 |
| N08 | Bonus seconds, Chronomancy and possible retained upgrades | Explicit stacking; no negative/refunded bonus pools, NaN, runaway tick lag or accidental double multipliers | `executeGameTicks`, `totalOfflineMs` |
| N09 | Predictor live vs worker on accelerated queue | Same relevant state on same action boundaries; neither prediction purchases upgrades nor archives timelines | `data.js`, `predictor-worker.js` |
| N10 | First-rerun grants plus durable choice | Skill points allocated legally, large boost applied and expired at the documented boundary, lasting ability changes actual play | Proposed first-grant and upgrade API |
| N11 | Veteran with completed `RestoreTime` but no new potion use | Original 90-point entitlement/history preserved; no unearned first-village entry or duplicate first-rerun grants without approved migration | `prestige.js`, RF02 |
| N12 | Existing pre-completion or old `ILSV01` save | Valid import still loads; Real World locked appropriately; old aliases and optional fields have safe defaults | `saving.js` migrations |
| N13 | Existing challenge-active save and normal slot | Both slots safe and recoverable; no surprise reset, double completion or trapped old challenge state | `challenges.js`, `idleLoopsChallenge` |
| N14 | Old Prestige and Challenges menus | Not independently usable in released Real World experience; any adapted bonuses/variants appear through new unified UX only | `views/menu.view.js` |
| N15 | First village on desktop/narrow viewport | Several alternate selves visible, one recognizes newcomer, readable/revisitable dialogue and keyboard focus | Pixel-art scene/UI |
| N16 | Repeat potion arrival, visits and dialogue | Correct once-only greeting, ordinary later dialogue, no cloned selves or repeat first-rerun grant | Outer flags |
| N17 | Several timeline records and future selves | Bounded archive and roster, safe outer state, no duplicate party recruits or rewards | Timeline archive/selves |
| N18 | Failed save/storage write during new-timeline transition | Original complete timeline and backup remain recoverable; no partially reset state | RF02 transaction boundary |

Tests N01–N38 are **not yet implemented or run**. A passing `npm run test:browser` currently proves only a basic original game startup/Wander/save reload, **not** these tests.

## Upgrade-tree acceptance and comparison (future tests only)

The three-tree recommendation and four-tree Dominion alternative introduce additional prospective cases. See the [detailed UT01–UT14 matrix](upgrade-tree-contracts.md) for fixtures and the relevant reset boundaries.

| ID | Scenario | Required observation |
| --- | --- | --- |
| **N19** | First lasting-upgrade choice after potion entry and new-timeline commitment | Distinct Will/Echoes/Anchors effects; first grant idempotent, not class-locked unless separately approved |
| **N20** | Will Pivot vs existing loadout/queue editing | Changes **current** legal loop execution beyond old controls; no duplicate cost/reward or travel bypass |
| **N21** | Echoes First Apprentice vs existing fixed action queue | Conditional known task stops at goal, impossible target or budget; does not generate resources free |
| **N22** | Anchors Memory reset and world survey | One approved whitelisted milestone survives full timeline reset; other progress/stories/gates stay consistent |
| **N23** | Treasury/Dominion capital persistence | Capped gold across explicitly stated resets, no gold/mana duplication or compounding exploit |
| **N24** | Will+Echoes / Echoes+Anchors / Anchors+Will | Adaptive Intervention / Persistent Workshop / Fixed Point operate with no repeated grants or infinite delegate work |
| **N25** | Three-tree UI vs four-tree Dominion alternative | Stable owned upgrade IDs, no lost purchases or new free credits; distinct Memory vs Dominion capabilities genuinely justify extra complexity |

**These cases are designs, not passing tests.** The initial three-tree UI and its Dominion alternative have not been implemented or playtested. Design choice RW-Q13 must be settled before claiming the final tree layout.

## Looping Potion entry and retained Valley (future tests only)

The [source-grounded potion/Valley study](potion-and-endgame-options.md) retains **PE01–PE12** as historical prospective cases, including prior **unselected** Valley-removal scenarios. They are not implemented and not active removal requirements. The selected direction keeps Valley playable and makes **drinking the potion** the independent Real World gateway. Both reputation paths, genuine potion inventory versus misleading story order, existing Totem/Wunderkind consumption and veteran Valley saves remain important.

| ID | Scenario | Required outcome for selected direction |
| --- | --- | --- |
| **N26** | Potion craft and deliberate drink entry | Verify actual craft/possession evidence, document the separate entry use and do not require `RestoreTime` |
| **N27** | Totem consumption versus Real World consumption | Wunderkind training remains viable; no double consume or false potion achievement via `storyMax` |
| **N28** | Valhalla and low-reputation Startington paths | Both can legally reach Real World via potion without a hidden inaccessible Spatiomancy gate |
| **N29** | Retained Valley/partial tower/old trial saves | No zone deletion; shortened capstone later preserves legacy progress and valid restore story |
| **N30** | Current/shorter Valley and potion entry on normal/~10× reruns | Valley no longer gates Real World and remains worthwhile; pacing and extra boost do not create time inconsistencies |

### Additional potion-first and first-rerun scenarios (planned, not implemented)

| ID | Scenario | Required outcome |
| --- | --- | --- |
| **N31** | First voluntary new timeline after potion arrival | An initial allocatable skill-point grant is delivered once, with clear targets, caps and persistence |
| **N32** | Major temporary first-rerun boost | Strong visible effect starts/ends at specified boundaries; no accidental permanent stacking with free ~10× speed |
| **N33** | Alternate Beginnersville first impression | Several selves visible; one recognizes the newcomer; exploration and replay control are accessible without a full party UI |
| **N34** | Restore Time completed before or after first potion entry | Valley story, credits and old prestige remain independent; neither order duplicates rewards |
| **N35** | Mid-visit reload, failed storage, repeated potion drinking | Original timeline remains recoverable; guide/first-rerun entitlements do not repeat |
| **N36** | Deeper systems disclosure and later parties | First village avoids full tree/key/wager tutorial; future party unlocks do not spawn uncontrolled workers |
| **N37** | Predictor with skill grant, temp boost start/expiry and normal ticks | Live engine and worker agree on costs, derived stats, expiry and no duplicate grants |
| **N38** | No potion but legacy Restore Time clear | Real World remains subject to an explicit approved veteran-entry migration, not an accidental automatic `RestoreTime` portal |

**N01–N38 and PE01–PE12 are plans, not passing tests**. The exact initial points, temporary boost, gateway action and veteran migration policy remain open and may require criteria refinement after owner choices.

## Pacing and "10× feels faster" research

The replay target means at least one clearly measurable, comparable segment of the original game takes **roughly one-tenth as much real waiting time** (under the same underlying simulated progression state). This is not a requirement to finish the entire campaign in 1/10th the time when the player is making different choices and performing new upgrades.

Suggested instrumented comparisons: "fresh Wander to first Buy Mana", "known early travel/production route", and "late-game repeat queue in a progressed synthetic save". Record wall-clock progression, effective game time, CPU/frame lag, non-finite values and predictor drift. Throughput tests should report machine and browser; automated timing checks need generous platform tolerance and independent deterministic rule assertions.

### Core playtest hypotheses

- **Replay pacing:** Is ~10× plus one practical upgrade enough to overcome the first game's long second-playthrough repetition? Does 10× need an optional low-speed accessibility/control setting?
- **Powerful upgrades:** Do players select different upgrade types for genuinely different reasons, or is one always obviously best?
- **Automation:** Are chores removed after mastery, while unknown progression and key strategic choices remain active?
- **Nexus atmosphere:** Does meeting an alternate self create curiosity and motivation, or is the hub perceived as another menu?
- **Single metagame:** Are legacy veterans' old bonuses recognized in the new system without being unfairly advantaged or losing investment?
- **Challenges:** Are optional divergent timelines fun enough to warrant preserving/rebuilding the old restriction modes?
- **Clarity:** Can the player tell an ordinary loop, a new timeline, and a return to Real World apart?
- **Performance:** Do high-speed queues still work in the browser without FPS collapse or runaway offline-bonus behavior?

Do not lock exact point costs, return rates, character limits, automation job timers or final 10× stacking behavior until the above are tested.

## Decision gates before implementation (recommended order)

1. **Preserve the selected ending distinction:** Valley remains but is shorter after campaign-wide pacing tests; `RestoreTime` is independent. Specify the actual potion-drinking gateway and verify both reputation routes (RW-D02/RW-D09, RW-Q18–Q19).
2. Select the guide-self's story role and final dialogue among several visible alternate villagers (RW-Q07/RW-Q30).
3. Approve separate potion entry, return to unfinished original timeline, Valley completion and explicit new-timeline semantics (RW-Q05–Q06/RW-Q31).
4. Choose legacy prestige effect retention and veteran-credit/backup policy (RW-Q01–Q02).
5. Define permanent ~10× throughput and **separate first-rerun skill-point/temporary boost** semantics and expiry (RW-Q04/RW-Q28–Q29).
6. Choose the **three-tree Will/Echoes/Anchors recommendation or the four-tree Memory/Dominion alternative**, then approve the minimum impactful starters, cross-tree requirements, acquisition economy, mastery/caps and free starter policy (RW-Q09–Q10, RW-Q13–Q16).
7. Determine old challenge reuse/retirement and safe challenge-active save transition (RW-Q03).
8. Approve the alternate Beginnersville pixel-art scale, visible ambient selves, guide approach and exploration interaction (RW-Q12/RW-Q30).

Once those are resolved, draft a dedicated **RW01/RW02 implementation handoff**, with tests and dependency evidence, before starting code.

## Review and release evidence

For any future PR capture: baseline/changed commit, affected game layers, fixture IDs and expected counters, live/worker predicted outputs, browser version, time budget, exact before/after saves (synthetic), rollback/recovery path, human playtest observations, and cases not run. No implementation milestone is accepted merely because JS syntax or basic opening action tests pass.
