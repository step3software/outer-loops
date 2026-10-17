# Looping Potion and Valley of Olympus — ending redesign options

**Status (2026-10-17): Design investigation and alternatives — NOT an approved decision to remove Valley of Olympus, change potion requirements, or rewrite the ending.** No gameplay or save changes have been made. This is an input to future Real World product decisions; see the [decision ledger](decisions.md) (RW-Q17–RW-Q21).

## Executive assessment

**The potion is an excellent candidate for a stronger narrative bridge to Real World, and the full Valley of Olympus endgame may be a poor recurring gate for the new outer loop.** But deleting Valley outright would erase a hard-earned climax and break interconnected gameplay. The best next design experiment is a **short, narratively satisfying capstone involving the potion after Jungle Path / in Commerceville**, while comparing it against a **condensed Valley** alternative. Do not choose a final structure without a pacing and progression review.

The existing canon offers both possible foundations: the original delivery potion caused the looping predicament, and the existing `Restore Time` story describes creating distinct alternate lives. A new ending could connect those mysteries **without claiming that the original world was fake** or prematurely defining how timeline travel works.

**Compatibility with prior direction:** RW-D02 currently approves a nexus reached after the *existing* `Restore Time` climax. The "remove Valley / replace the final ritual" approach would **revise that earlier direction**, not merely implement it. Until explicitly adopted, preserve the current ending and nine-zone progression as authoritative; all paths below are prospective.

## 1. As-coded potion: accessible before Valley

The protagonist's original predicament begins when a **courier** accidentally spills the mysterious liquid and starts repeating their day (English global story 0 in `lang/en-EN/game.xml`). The player later recognizes the recreated **Looping Potion** as the same substance (global story 9, `actions>looping_potion`).

### Actual acquisition sequence and gates

| Step | Area | What the executable code requires |
| --- | --- | --- |
| Learn Alchemy | **Forest Path (1)** | Train via `Learn Alchemy` after Hermit/skill progression; Alchemy itself is **not learned on Mt. Olympus** |
| Learn Spatiomancy | **Valhalla (4)** | Train via the `Spatiomancy` action after Tour progress and Wizard College enrollment; the action is visible at Tour level 40, unlocked at level 60 and needs `resources.wizardCollege` |
| Return to craft | **Mt. Olympus (3)** | `Action.LoopingPotion`: **visible** at Spatiomancy ≥1; **unlocked** at Alchemy ≥200; `canStart` requires herbs ≥400; `cost` spends 400 herbs; mana cost 30,000; grants a true `resources.loopingPotion` flag and 100 Alchemy XP |
| Use at Totem | **Jungle Path (6)** | `Action.Totem`: visible at Explore Jungle level 25; unlocked at 50; requires and **consumes** the potion; costs 30,000 mana and awards 100 Wunderkind XP |

**Important distinction:** the potion's current crafting action is located in earlier-numbered **Mt. Olympus**, but obtaining the required Spatiomancy skill typically means **progressing to Valhalla and coming back in a later loop**. Numeric zone order is not the same as earliest feasible access.

Code links: [potion action](../../../actionList.js), [Totem and Escape](../../../actionList.js), [Alchemy/Spatiomancy and skills](../../../stats.js), [world resources](../../../saving.js), [English action/story text](../../../lang/en-EN/game.xml). Read the named `Action.*` definitions rather than relying only on localization.

### What the potion currently does — and does not do

- **Direct consumption:** `Totem.cost()` sets `resources.loopingPotion` to false. `Totem.finish()` grants the Wunderkind skill XP. The consumed item is a **temporary boolean per-loop resource**, not a stack of brewed bottles stored across runs.
- **Training benefits:** Wunderkind raises **talent XP gain** via its skill multiplier and, when Wunderkind level is nonzero, `restartStats()` starts ordinary loops at **twice the Imbue Body-derived starting stat levels**. This is a repeatable character-improvement use, not a final escape.
- **Optional:** The current `Action.Escape` in Jungle Path is **not gated by the potion**. `Action.RestoreTime` in Valley requires built tower/power, **not** `resources.loopingPotion` or `storyFlags.loopingPotionMade`. The potion is **not required** for Valley access, completion or existing prestige.
- **No direct second ending:** Recreating/drinking it does not open Real World, restore time or award prestige. Its global story explicitly reflects uncertainty about why recreating it matters.
- **Implementation caveat:** The English tooltip says "only one" potion, correctly describing a boolean inventory flag, but `LoopingPotion.canStart()` checks **herbs only**, not `!resources.loopingPotion`. Repeated crafting while already holding one can consume more herbs without storing another. This is a present code/tooltip mismatch candidate, **not** proof of a player-facing incident.
- **Story flag caveat:** Crafting sets `storyFlags.loopingPotionMade` and unlocks global story 9. `Escape.story()` unlocks global story 10 and contains a source FIXME: story presentation can imply global story 9 completed **without** actual crafting. If a future ending requires the potion, it **must test the actual achievement/resource predicate**, not infer crafting merely from `storyMax >= 9` or global story visibility.

### A key route-design complication

`Action.FaceJudgement` at Mt. Olympus ordinarily enters **Valhalla** only with reputation >50; a lower-reputation outcome goes directly to **Startington**. Valhalla's Wizard College trains `Spatiomancy`, which is a prerequisite to **seeing** the potion crafting action. A high-level alternative `Guru` route reaches Valhalla with significant exploration/herb prerequisites, but is not an equally early default path.

**Consequently, "make the potion mandatory" is not a free change:** it risks accidentally **forcing the divine/reputation path** and punishing players who take the shadow route. We need either alternate potion research/access in the shadow path, a later unifying source, an achievable route back to learning Spatiomancy, or an ending that accepts **equivalent evidence of temporal mastery**.

## 2. What Valley of Olympus currently contributes

Valley (zone index 8) contains **six actions**, but is the final convergence of several prior systems:

| Existing component | Current role | If Valley is removed or condensed |
| --- | --- | --- |
| `Purchase Key` / `Leave City` (Commerceville) | One-million-gold key then travel to zone 8, unlocking global story 11 | Redesign the key and route transition, repurpose the key, or retire them knowingly |
| `RuinsZ1/Z3/Z5/Z6` and `HaulZ1/Z3/Z5/Z6` | Discover and transport **temporal stones** from four previous zones | Otherwise these actions lose most of their payoff and need a new role, optional purpose or removal |
| `Build Tower` | Needs one carried stone per finish, 505 progress XP per stone; **1,000 successful stones** reach 100 linear levels | Main source of the late-game repeat burden; consider short ritual/optional world-restoration project instead |
| `GodsTrial` / `ChallengeGods` | Deep trials, divine power acquisition (100-floor + seven-floor progression), battle climax | Replace with shorter test, move to optional variant challenge, or preserve a condensed confrontation |
| `Imbue Soul` | Exchanges substantial prior training/soulstones/buffs for `Imbuement3` | Rehome, retire or redesign; it interacts with original prestige carryover, training and optional late-game gates |
| `Restore Time` | Final 7,777,777-mana action after tower level 100 and ≥8 power; `completedCurrentGame()` grants legacy 90 points | Preserve a recognizable climax/identity/credits, but choose a new legitimate gate and completion event |
| `Secret Trial` in Commerceville | Its visibility depends on **global story 12** and `Imbuement3 >= 7` | Removing Imbue Soul or final story must address this **zone-7** optional trial as well |

The Valley also supports the original narrative: reaching the gods, reconstructing the tower and weaving time back into an array of alternate lives. Removing its grind is attractive, but **the sense of accomplishment and cross-world culmination must survive**.

## 3. Three ending structures to compare

| Option | Endgame structure | Strength | Principal risk |
| --- | --- | --- | --- |
| **A. Preserve original Valley** | Commerceville → buy key → Valley, 1,000 stones, trials → Restore Time → Real World | Maximum source fidelity, existing balance/endgame and story continuity | Repeats a long, highly mechanical grind before each major new outer-layer decision |
| **B. Condense Valley** | Commerceville → brief Valley capstone using selected discoveries/stone/god content → Restore Time → Real World | Keeps divine/tower climax and source narrative while sharply reducing grind | Still a ninth zone and needs significant rebalance/removal or reinterpretation of stone/trial progress |
| **C. End in Commerceville; retire playable Valley** **(recommended for exploration)** | Complete original world themes; study/recreate potion and time anomaly, resolve a compact final quest/ritual; Restore Time or successor → new threshold → Real World | Strong narrative return to the game's inciting incident; faster repeat cycles; clear shift to timeline management | Must replace the godly climax, preserve route choices, compensate earlier-zone stone content and carefully migrate saves |

Option C is a **design hypothesis**, not an approved deletion. A more radical **Jungle Totem → Real World** transition is also imaginable but currently less compelling: it would skip much of **Commerceville** (economy, thieves, Explorer Guild, survey bootstrap, late discoveries). Do not remove those systems accidentally just because the potion is used in Jungle Path.

### Recommended capstone sketch if C is selected later

**Narrative hypothesis, not a requirement:** The potion is not *just* something that repeats a day; understanding it offers a way to perceive/repair the **fraying boundaries between possible lives**. This is compatible with, but does not prove, the original timeline-weaving story.

1. **Recreate or understand the Looping Potion** through a genuine accomplishment (crafting where feasible, or an equally demanding alternative temporal-research route if the player skipped Valhalla).
2. **Uncover the anomaly's pattern** via a compact late-game task, potentially seeded by Jungle Totem research, Chronomancy, or existing Explorer Guild/world knowledge. Preserve the original system's identity rather than forcing every guild into one mandatory laundry list.
3. **Resolve a final challenge** in or after Commerceville: one memorable action or short chain with readable requirements and a legitimate payoff, not a new hidden 1,000-iteration bar.
4. **Restore Time / stabilize a thread** as the climactic act. Keep `Restore Time` terminology/ending credits if possible, but rewrite the exact old god-power gate only after design approval.
5. **Reveal a new threshold** to Real World; meet the other self. Preserve the existing division between **completion**, **crossing the portal**, and **starting another timeline**, with no forced reset or double awards.

Possible variations to test include **brew and study**, **ritual at the Totem followed by a final discovery**, or **alternative routes (magic / economic research / exploration)** that express different timeline histories. Multiple endings and unique selves could be a later expansion—not an initial dependency. Each approach must be achievable on both reputation branches.

### Why the potion should not be merely another grind key

If the potion becomes required, make its **first creation/understanding** an important story beat. On later, free ~10× replays the player should have meaningful routes to **reuse remembered knowledge, prepare its ingredients via Echoes, or unlock an alternative legal capstone**. Rebrewing the same potion 100 times merely to clear another prestige would recreate Valley's flaw in miniature.

Keep the Totem **useful** regardless of where the final capstone goes. The current potion→Totem→Wunderkind route can remain an optional training application even when separate timeline research uses a **knowledge flag or derived conclusion** instead of consuming the same boolean item. Avoid a binary conflict where drinking the potion for stat training permanently prevents finishing a timeline.

## 4. What should be preserved regardless of the option

**Product invariants already adopted elsewhere** remain: Real World is a **separate outer scene**, not an ordinary `Town(9)`; first encounter is with another self; the second timeline receives a **free ~10× baseline speed** plus strong permanent choices; the old dmchurch prestige/challenge menus do not remain as parallel metagames.

**Existing-source boundaries that require migration planning:**

- **Story:** Separate `loopingPotionMade` flag from global story numbering. Preserve the original courier accident and credits, and intentionally redesign global stories 9–12 rather than renumber them casually. Do not imply that simply visiting Commerceville proves the potion was made.
- **Persistent saves:** Current `doSave/doLoad` serializes progress using action `varName` keys and town indices. Existing veteran saves can hold `expBuildTower`, `stonesUsed`, `trials`, `Imbuement3`, legacy `prestigeValues` and `townsUnlocked` containing 8. A proper conversion/archive or compatibility shim is required.
- **Town and action registries:** `townNames`, `initializeTowns`, `Action.*` registration, zone-specific UI/queue/planner, travel deltas and localized action names assume the current nine-zone world. Physically deleting `Town(8)` is **not the first safe step**; hidden/deprecated zone-8 compatibility support may be needed for imports while new player-facing progression only uses eight areas.
- **Surveys:** Global exploration uses `SurveyZ0..8` and an **average across nine zones**. Changing the divisor/indices changes shortcut and map availability, not just display. The Explorer Guild's bootstrap in Commerceville is essential.
- **Trials/buffs:** Removing `GodsTrial`/`ChallengeGods` or `ImbueSoul` without reviewing `trialFloors`, story flags, `SecretTrial`, `getSpeedMult`, talent training and original prestige retention can produce dead progression paths.
- **Predictor:** Removing/repointing `RestoreTime`, `LeaveCity` and trial actions changes the same registry inspected by action predictors, action loadouts and source-generated docs.
- **Nexus grants:** New completion must not call both the old `completedCurrentGame` 90-point award and a new outer reward. Veteran conversion remains an open, separately approved policy.

See [technical architecture](technical-architecture.md), [legacy transition](legacy-transition.md), [RF coordination](integration-with-refactoring.md) and [source-grounded current endgame](../../audit/progression.md).

## 5. Acceptance questions and research before approving removal

1. **Completion pacing:** Measure real progression time for the original first completion and the likely duration of full Valley stone/trial repetition in later ~10× timelines. Is the bottleneck *meaningful play* or mostly solved repetition?
2. **Climax:** Can a potion/research finale make Restore Time feel as earned as defeating the gods? What original-world systems must the player demonstrate mastery of?
3. **Route freedom:** Can both high-reputation **Valhalla** and low-reputation **Startington** players satisfy the new final gate without retroactively needing an inaccessible skill?
4. **Totem:** Does potion study coexist with current Wunderkind gain? Can the player rebrew or remember the achievement without dead ends?
5. **Commerceville:** Does the new ending preserve the Explorer Guild bootstrap, investments and other late-game decisions, or make the city an unnecessary detour?
6. **Optional content:** Should stone haul, Imbue Soul, divine trials and Secret Trial become optional/completionist content, nexus variants, or be retired with credible alternatives?
7. **Old saves:** Can a save inside Valley/with partially built tower or ImbueSoul buffs be imported, resumed or fairly migrated without a destructive reset?
8. **Replay:** With ~10× baseline speed, Will/Echoes/Anchors (or Dominion) starter powers, how many *new* decisions exist during a second completed timeline versus repeated potion chores?
9. **Story and UI:** Where do original credits, original global story 12, key purchase and new threshold appear after redesign?

### Proposed testing matrix — *not yet executed*

| Test ID | Synthetic scenario | Expected when option C is eventually approved |
| --- | --- | --- |
| PE01 | Alchemy progression in Forest; Spatiomancy in Valhalla; potion on Mt. Olympus | Exact visibility, unlock, resource costs and crafting story flags characterized first |
| PE02 | Repeat potion crafting while already carrying one | Confirm existing boolean/cost behavior; fix only if separately approved |
| PE03 | Brew, carry to Totem and consume in same inner loop | Expected 100 Wunderkind XP, training/start-stat results and inventory reset |
| PE04 | Escape without brewing potion | Original progression remains possible; replacement design defines intentionally changed gate |
| PE05 | Low-reputation direct shadow route | Chosen replacement ending remains attainable without forced missing Valhalla prereq |
| PE06 | New finale completion, portal crossing, new timeline start | Three separate idempotent events; no duplicate grants and no forced reset |
| PE07 | Existing save in Valley, in trials, with tower/stone progress | Import safely recovers, converts or archives progress under an explicit, reviewed rule |
| PE08 | Existing potion flag/storyMax mismatch | Progress checks consult actual valid flags rather than falsely assuming crafted potion |
| PE09 | Six old Valley actions removed/retired or moved | No invalid action records, zero broken travel queue, predictor/workers, localized stories or save keys |
| PE10 | Survey progress on 8 vs 9 zones | Equivalent intended global Explorer Guild/map progress; no stealth balance shift |
| PE11 | Former trial/ImbueSoul buff and old prestige save | Intended reward/training treatment and safe veteran entitlements; no ghost challenge |
| PE12 | Early/late replay at free ~10× baseline | New route is substantially quicker without trivial climax, repetitive craft bottleneck or wall-clock/effective-time inconsistency |

None of PE01–PE12 has been implemented as a test as part of this documentation.

## Recommended next design decision

First choose **A (unchanged Valley), B (short Valley), or C (Commerceville capstone)**. I lean **C** for the intended shorter, more replayable outer loop, *provided* the replacement finale is strong and both reputation routes remain viable; **B** is the lower-risk fallback that retains the original mythic climax. Then decide whether **crafting the Looping Potion** is mandatory for first completion, whether its knowledge can substitute later, and whether Totem remains an independent optional application.

**Nothing in this proposal constitutes approval to change the current game or the existing approved RW-D02 narrative bridge.** A later implementation request must explicitly update [decisions](decisions.md), reconcile [roadmap](roadmap.md) and state migration, and add tests before changing `actionList.js` or removing zone-8 behavior.
