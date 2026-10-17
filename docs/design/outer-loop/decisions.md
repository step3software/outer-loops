# Real World — decisions and questions

**Purpose:** Keep confirmed product direction separate from recommendations and issues that need genuine design/playtest decisions. Last updated: 2026-10-17.

## Approved product direction (do not reopen casually)

| ID | Decision | Consequence |
| --- | --- | --- |
| RW-D01 | Add **Real World**, a location outside the existing game, as the true outer prestige/timeloop nexus | Do not append a normal ninth-index/10th town; separate lifetime and UI |
| RW-D02 | Arrive after original `Restore Time` ending, **through a new portal/threshold** | Preserve existing `Open Portal` (jungle → forest) gameplay and original climax |
| RW-D03 | On first arrival meet **one other version of the protagonist** | Character-driven opening, not simply a passive upgrade shop |
| RW-D04 | Old standalone **Prestige Perks** and **Challenges** systems **must not remain separately** in the released new experience | Reuse selected capabilities/concepts *or* discard them; do not run two competing metagames |
| RW-D05 | A fresh timeline after the first completion is **roughly 10× faster by default**, **plus substantial permanent upgrade choices** | Replay acceleration is intrinsic; it is not an upgrade purchase or "prestige perk" to grind |
| RW-D06 | Build a modest initial hub with meaningful choices **before** evolving into a richer multi-self/timeline-management game | Avoid full concurrent simulation of many complete games in the initial scope |
| RW-D07 | Develop a cohesive **pixel-art graphic style**; the Real World is an appealing early showpiece | Art milestones can proceed separately from simulation/serialization code |
| RW-D08 | Preserve the possibility that other selves came from alternate endings/choices | Leverage current Restore Time narrative rather than overwrite it with an unrelated explanation |

## Recommended provisional choices (not yet approved)

| ID | Recommendation | Rationale |
| --- | --- | --- |
| RW-P01 | Automatic +10× **inner-timeline wall-clock execution throughput**, from the first new timeline, while leaving per-action costs and the in-world causal clock alone | Fast replays without invalidating progression/route logic |
| RW-P02 | One initial alternative self with conversation and at least one eventual *functional* contribution; later selves tied to distinct timeline outcomes, not a copy per replay | Emotional payoff, roster readability and meaningful specialization |
| RW-P03 | Offer an impactful early **automation/retained-knowledge** upgrade alongside speed | Player has a different problem to solve on playthrough two, not just a shorter wait |
| RW-P04 | Keep the completed original timeline accessible/inspectable until the player **chooses** to start a new timeline | Avoid abrupt loss and let the narrative finale breathe |
| RW-P05 | Use **one authoritative outer-state store** with schema version and an archived timeline summary, separated from ordinary loop and trial state | Safer reset/save boundaries and future parallel timelines |
| RW-P06 | Fold *some* legacy prestige effects into redesigned node/character/timeline upgrades; retire the old shop/point economics | Recaptures useful balance research without forcing old UX or runaway multiplicative stacking |
| RW-P07 | Reimagine *selected* old challenge conditions as opt-in timeline variants with meaningful identity/rewards, not a mandatory campaign | Reuse themes while removing legacy challenge menu and monkey-patched rules |
| RW-P08 | First version should show a small, atmospheric pixel-art hub with two recognizable but distinct sprites | Creates visual identity without art for 157 actions on day one |

## Unresolved questions — priority for further design

| ID | Question | Current leaning / options | Blocking scope |
| --- | --- | --- | --- |
| RW-Q01 | Which **legacy prestige effects** are worth retaining and how are preexisting purchases treated? | **Hybrid**: remap only useful effects; convert/restored old invested value fairly; retire old UI | Legacy migration and permanent upgrade tuning |
| RW-Q02 | What happens to the **90 old points**, unused points, prior completions and repeated Restore Time achievements? | Avoid directly importing 90 points per run as the new currency by assumption; no double award; show existing veterans an appropriate starting grant | Currency and migration |
| RW-Q03 | Do **Mana Drought**, **Noodle Arms**, **Mana Burn** or other old challenge variants return? | Rebuild only those that add interesting distinct choices, or discard; don't preserve as separate bonus-less menu | Challenge system/legacy save |
| RW-Q04 | How does the ~10× base rate **stack** with gameSpeed, offline time, Chronomancy, Imbue Soul, challenge rules and frame budgets? | Keep separate from earned multipliers; define before implementation with real game/predictor parity tests | Replay speed architecture |
| RW-Q05 | Exactly when is a timeline considered **completed** and when does the portal appear? | `RestoreTime.finish` event, unlock once; make crossing into Real World an explicit choice | First-visit narrative and UI |
| RW-Q06 | Can a player **re-enter** a completed timeline after entering the nexus? | Yes initially, until explicitly starting a new one; decide what "archive" means | UI, save lifetime and safety |
| RW-Q07 | Who is the **first other self**? Have they been waiting, do they remember multiple timelines, or are they equally surprised? | An apparently experienced self with incomplete knowledge; avoid locking cosmology too early | Narrative/script |
| RW-Q08 | How are future selves **earned and differentiated**? | Distinct achievements/build/choices rather than every clear producing an NPC | Roster and challenges |
| RW-Q09 | What is the permanent **currency and pricing** model? | Avoid grindy small buffs; milestone rewards/choice-based upgrades first; rates need pacing tests | Upgrade system |
| RW-Q10 | Which parts of the original campaign can automation bypass, and which retain player agency? | Gradually automate mastered repetition; don't automate first discovery or full game before mastery | Automation |
| RW-Q11 | Does the name **Real World** literally mean outside a simulation, or outside time? | Keep ambiguous; no "your past game wasn't real" assertion at first meeting | Lore/art/marketing |
| RW-Q12 | How much pixel art belongs in the initial slice? | Two character sprites, one small hub and portal/environment effects; expand original-world art separately | Art scope/performance |

## Change control and conflicts

The proposed retirement of legacy challenges affects **RF04**, whose previously documented refactor charter would preserve existing modes while removing monkey-patching. That is still a valid *intermediate compatibility refactor*, but should not be executed simply because it was planned if the product will instead retire/reframe these modes. See [RF integration](integration-with-refactoring.md). Do not silently change approved RF charters in this design-only effort.

The **exact** 10× factor is a target experience, not a chosen implementation formula. The intent is a powerful immediate difference after the first campaign, independently of purchased upgrades. It may require tuning to avoid saturating the browser tick loop or breaking time-sensitive gates.

When a question is answered, record the date, choice, rejected alternatives and changed documents here. New product decisions do not authorize a merge or edit of gameplay code.
