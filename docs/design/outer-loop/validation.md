# Real World — future tests, playtests and acceptance questions

**Status:** Prospective tests and questions. Nothing in this file is evidence that Real World is implemented or playtested. Existing baseline tests are documented under [audit coverage](../../audit/coverage.md).

## What must feel different

After playing a substantial original campaign, the player should be able to answer **yes** to:

1. "Restore Time still felt like a real accomplishment."
2. "I immediately recognized the other character as another me."
3. "The new area felt different from an ordinary ninth region."
4. "I was not forced to throw away my finished timeline just by entering."
5. "On my next timeline, play was about **ten times faster by itself**."
6. "At least one permanent choice changed what I **planned or automated**, not merely how long I waited."
7. "There is one clearly understandable permanent progression system—not both the legacy Prestige Perks menu and a new shop."
8. "There are reasons to try another timeline, but I still make consequential decisions."

If the response to 5 or 6 is no, the first vertical slice is not ready merely because the pixel art looks good.

## Implementation regression matrix (planned)

| ID | Scenario | Required result / invariant | Related source/risk |
| --- | --- | --- | --- |
| N01 | Fresh save, no Restore Time | Real World unavailable; original nine-zone play and ending progression unchanged | `actionList.js`, `town.js` |
| N02 | First `RestoreTime` completion | Original story/credits accessible; nexus unlock recorded once; no double legacy/new reward | `Action.RestoreTime`, `prestige.js` |
| N03 | Complete / refresh / complete again | No second first-visit, duplicated self, duplicate reward or reset; idempotency survives refresh | `saving.js` |
| N04 | Enter and leave Real World without new timeline | Previously completed timeline and progress remain available (subject to approved RW-Q06 policy) | Outer/timeline save lifetime |
| N05 | Explicit start of new timeline | Timeline-only state resets as specified; owned upgrades, first-visit flags and archived summary remain | RF02, `restart`, old prestige |
| N06 | Equivalent queue before/after replay acceleration | Around 10× wall-clock throughput where not CPU limited; same logical action costs, stat XP per action, progress and mana budget | `driver.js` `gameSpeed` / `getSpeedMult` |
| N07 | Time-sensitive gates and speed | `Escape` behavior at 59.9/60.0/60.1 effective sec preserved; no paradox introduced by raw throughput boost | `Action.Escape.canStart`, RF03 |
| N08 | Bonus seconds, Chronomancy and possible retained upgrades | Explicit stacking; no negative/refunded bonus pools, NaN, runaway tick lag or accidental double multipliers | `executeGameTicks`, `totalOfflineMs` |
| N09 | Predictor live vs worker on accelerated queue | Same relevant state on same action boundaries; neither prediction purchases upgrades nor archives timelines | `data.js`, `predictor-worker.js` |
| N10 | Starter permanent capability | Changes actual plan/action sequence; deterministic, understandable and not a hidden +% without visible strategic effect | Proposed upgrade API |
| N11 | Existing veteran with bought prestige buffs and unspent points | No silent loss of earned entitlement; one reviewed migration/credit policy; no dual metagame | `prestigeValues` / `buffs`, RF02 |
| N12 | Existing pre-completion or old `ILSV01` save | Valid import still loads; Real World locked appropriately; old aliases and optional fields have safe defaults | `saving.js` migrations |
| N13 | Existing challenge-active save and normal slot | Both slots safe and recoverable; no surprise reset, double completion or trapped old challenge state | `challenges.js`, `idleLoopsChallenge` |
| N14 | Old Prestige and Challenges menus | Not independently usable in released Real World experience; any adapted bonuses/variants appear through new unified UX only | `views/menu.view.js` |
| N15 | First meeting on desktop and mobile-size screen | Other self visually recognizable, text readable, keyboard focus/escape/revisit supported | Pixel-art hub/UI |
| N16 | Repeat Real World visits | Updated/revisitable dialogue, no cloned NPCs, clear return/new-timeline actions | Dialogue/outer flags |
| N17 | Multiple completed records | Archive bounded, no loss of nexus/entitlements, no unlimited duplicate selves/rewards | Timeline archive/persistence |
| N18 | Failed save/storage write during new-timeline transition | Original complete timeline and backup remain recoverable; no partially reset state | RF02 transaction boundary |

Tests N01–N25 are **not yet implemented or run**. A passing `npm run test:browser` currently proves only a basic original game startup/Wander/save reload, **not** these tests.

## Upgrade-tree acceptance and comparison (future tests only)

The three-tree recommendation and four-tree Dominion alternative introduce additional prospective cases. See the [detailed UT01–UT14 matrix](upgrade-tree-contracts.md) for fixtures and the relevant reset boundaries.

| ID | Scenario | Required observation |
| --- | --- | --- |
| **N19** | First-upgrade choice after Restore Time | Distinct Will/Echoes/Anchors effects; first grant idempotent, not class-locked unless separately approved |
| **N20** | Will Pivot vs existing loadout/queue editing | Changes **current** legal loop execution beyond old controls; no duplicate cost/reward or travel bypass |
| **N21** | Echoes First Apprentice vs existing fixed action queue | Conditional known task stops at goal, impossible target or budget; does not generate resources free |
| **N22** | Anchors Memory reset and world survey | One approved whitelisted milestone survives full timeline reset; other progress/stories/gates stay consistent |
| **N23** | Treasury/Dominion capital persistence | Capped gold across explicitly stated resets, no gold/mana duplication or compounding exploit |
| **N24** | Will+Echoes / Echoes+Anchors / Anchors+Will | Adaptive Intervention / Persistent Workshop / Fixed Point operate with no repeated grants or infinite delegate work |
| **N25** | Three-tree UI vs four-tree Dominion alternative | Stable owned upgrade IDs, no lost purchases or new free credits; distinct Memory vs Dominion capabilities genuinely justify extra complexity |

**These cases are designs, not passing tests.** The initial three-tree UI and its Dominion alternative have not been implemented or playtested. Design choice RW-Q13 must be settled before claiming the final tree layout.

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

1. Select first self's story purpose and approval of the first encounter beats (RW-Q07).
2. Approve explicit timeline completion, portal entry and return/new-timeline semantics (RW-Q05–Q06).
3. Choose legacy prestige effect retention and veteran-credit/backup policy (RW-Q01–Q02).
4. Define exactly how default ~10× stacks with timekeeping and old modifiers (RW-Q04).
5. Choose the **three-tree Will/Echoes/Anchors recommendation or the four-tree Memory/Dominion alternative**, then approve the minimum impactful starters, cross-tree requirements, acquisition economy, mastery/caps and free starter policy (RW-Q09–Q10, RW-Q13–Q16).
6. Determine old challenge reuse/retirement and safe challenge-active save transition (RW-Q03).
7. Approve the initial pixel-art style/sprite scale and interaction scheme (RW-Q12).

Once those are resolved, draft a dedicated **RW01/RW02 implementation handoff**, with tests and dependency evidence, before starting code.

## Review and release evidence

For any future PR capture: baseline/changed commit, affected game layers, fixture IDs and expected counters, live/worker predicted outputs, browser version, time budget, exact before/after saves (synthetic), rollback/recovery path, human playtest observations, and cases not run. No implementation milestone is accepted merely because JS syntax or basic opening action tests pass.
