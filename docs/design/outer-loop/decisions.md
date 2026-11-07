# Real World — decisions and questions

**Purpose:** Keep confirmed product direction separate from recommendations and issues that need genuine design/playtest decisions. Last updated: 2026-11-06 (potion-first clarification).

## Approved product direction (do not reopen casually)

| ID | Decision | Consequence |
| --- | --- | --- |
| RW-D01 | Add **Real World**, a location outside the existing game, as the true outer prestige/timeloop nexus | Do not append a normal ninth-index/10th town; separate lifetime and UI |
| RW-D02 | Drink the recreated **Looping Potion** to enter Real World: a changed Beginnersville populated by other selves. **Valley/Restore Time is not the entry route** | Supersedes the prior post-Restore Time portal requirement; keep potion entry, Valley ending and new-timeline reset separate |
| RW-D03 | Multiple alternate selves are visible on arrival; one notices the newcomer, approaches and talks | The first encounter feels social and exploratory, not like a prestige-shop opening |
| RW-D04 | Old standalone **Prestige Perks** and **Challenges** systems **must not remain separately** in the released new experience | Reuse selected capabilities/concepts *or* discard them; do not run two competing metagames |
| RW-D05 | The first new timeline, started by choice after potion arrival, gets free **~10× replay speed**, initial **skill points** and a **major temporary boost**, plus access to meaningful permanent choices | Separate permanent throughput from a bounded temporary reward; point type, amount and boost effect/expiration remain open |
| RW-D06 | Begin with a modest explorable alternate Beginnersville; reveal advanced systems gradually, culminating in party-based play with other selves | Avoid a feature dump, full roster controller or many concurrent simulations in the first release |
| RW-D07 | Develop a cohesive **pixel-art graphic style**; the Real World is an appealing early showpiece | Art milestones can proceed separately from simulation/serialization code |
| RW-D08 | Keep alternate-ending/choice selves possible and preserve original Restore Time story without making it an entry gate | Existing Valley climax/credits remain meaningful even if potion access occurs earlier |
| RW-D09 | **Retain Valley of Olympus** as an independently rewarding, eventually **shorter** capstone in a campaign-wide rebalance | Preserve zone 8 and current mechanics until baseline pacing tests and separate implementation approval; no Valley completion gate for Real World |
| RW-D10 | The first arrival follows **potion → alternate Beginnersville → recognition by one self → exploration → first empowered rerun**; subsequent timelines reveal more systems and eventual parties | Reframe RW00–RW05 without renumbering or accepting their implementation plans |

## Selected entry and Valley direction — 2026-11-06

On 2026-11-06 the owner first selected **B: retain Valley as a shorter capstone**, with baseline measurement and a coordinated rebalance across all campaign sections. The owner **then clarified**: “we can actually still keep the valley of the gods, there's no reason to remove it. It's just not the route to reality.” The subsequent potion-first description establishes that **drinking the Looping Potion** brings the player back to a recognizably changed starter village populated by other selves, one of whom notices that the player is new. The player can explore before choosing a first rerun with initial skill points and a powerful temporary boost.

**RW-D02's earlier post-`Restore Time` portal requirement is explicitly superseded.** The Valley-shortening decision is **not** reversed. The original `RestoreTime` achievement, narrative, credits and legacy prestige behavior remain *as-coded* until separately authorized changes, but they are not intended to gate the new Real World.

**Real World is a separate state/scene**, not a replacement of normal `Town(0)`. Potion entry, guide-self introduction, choosing to start a new timeline and receiving one-time rerun benefits are separate transitions. The first rerun retains the previously approved free ~10× wall-clock acceleration; the temporary boost and points are additional, not an unapproved multiplier formula.

The [RW00 campaign balance test plan](balance-tests-implementation-plan.md) remains the future shorter-Valley measurement baseline. Exact potion acquisition for the shadow route, separate Totem use, point economy, temporary boost specification, state retention and return UX are unresolved. These decisions approve product direction **only**, not a stage transition, implementation, merge or deployment.

## Owner decisions on 2026-11-06

Evidence: owner replies in this Codex chat (America/New_York), retained here as bounded decision provenance. These answers do not accept a plan or authorize test/game implementation.

| ID | Owner answer | Alternatives and scope |
| --- | --- | --- |
| RW-Q17 | B: keep Valley as a shorter capstone | A unchanged Valley and C Commerceville replacement were not selected; the Valley is *not* the Real World route. |
| RW-D02 | Potion consumption enters alternate Beginnersville; not gated by Restore Time | Explicit reversal of the earlier post-Restore Time portal gateway, not of faster-Valley pacing. |
| RW-D03 | Several selves already occupy the alternate village; one notices and speaks to the newcomer | First encounter before the later party/automation tutorial. |
| RW-D05 | First rerun includes skill points, a major temporary boost and free permanent ~10× replay throughput | Point amount, temporary effect/duration and stacking remain open. |
| RW-Q20 | Resolved as inapplicable: Valley is retained | No replacement for tower, gods, temporal stones or `ImbueSoul` is required for the Real World gateway. |
| RW00-BALANCE-SCOPE | Write section-duration balance tests and rebalance the campaign together | No Valley-only tuning effort; first measure all sections. |
| RW00-PACING-TARGETS | Measure the current campaign first, then choose total and section budgets from the results | No first-completion duration or section budget selected yet. |

Exact first response: “2. We need to write "balance" tests basically tests for how long each section takes and rebalance, we'll do that all at once not just the valley”. The follow-up selected “Measure the current campaign first, then choose total and section time budgets from the results (Recommended).”

The owner subsequently requested an [implementation plan for these tests](balance-tests-implementation-plan.md). The plan is draft documentation, separate from later implementation authorization.

## Working tree design direction (documented, not finalized)

The **recommended** player-facing structure is **Will / Echoes / Anchors**. Will grants deliberate active control; Echoes grants conditional automation and delegation; Anchors retains bounded knowledge, **Treasury/economic value**, and infrastructure across chosen reset boundaries. There is **no** separate default Currency tree or second legacy prestige shop. Documented starting examples: **Pivot / First Apprentice / Anchored Memory**, in addition to the agreed free ~10× replay acceleration. Cross-tree synergies include **Adaptive Intervention**, **Persistent Workshop**, and **Fixed Point**. See [three-tree design](upgrade-trees.md).

**Not ruled out:** a **four-tree architecture (Will / Echoes / Memory / Dominion)** that separates learned progress from economic ownership and infrastructure. Dominion is a serious independent tree, not a renamed minor currency multiplier. See [the complete alternative](dominion-alternative.md). The user requested **both** documented, and the choice of final tree count is still open. No upgraded node, starter grant, mastery gate, cap, synergy or refund policy is implemented or finalized.

## Recommended provisional choices (not yet approved)

| ID | Recommendation | Rationale |
| --- | --- | --- |
| RW-P01 | Automatic +10× **inner-timeline wall-clock execution throughput**, from the first new timeline, while leaving per-action costs and the in-world causal clock alone | Fast replays without invalidating progression/route logic |
| RW-P02 | Show several alternate selves at first arrival, with one recognizing and guiding the newcomer; later companions gain distinct identities | A familiar-but-uncanny welcome before unlocking party control |
| RW-P03 | Pair the initial skill-point and temporary-boost grants with a later meaningful automation/retained-knowledge choice | Exciting first rerun and enduring strategic differentiation |
| RW-P04 | Preserve an unfinished or completed original-world timeline until **explicit new-timeline confirmation**, not merely potion entry | Entering the new village must not destroy Valley or other current progression |
| RW-P05 | Use **one authoritative outer-state store** with schema version and an archived timeline summary, separated from ordinary loop and trial state | Safer reset/save boundaries and future parallel timelines |
| RW-P06 | Fold *some* legacy prestige effects into redesigned node/character/timeline upgrades; retire the old shop/point economics | Recaptures useful balance research without forcing old UX or runaway multiplicative stacking |
| RW-P07 | Reimagine *selected* old challenge conditions as opt-in timeline variants with meaningful identity/rewards, not a mandatory campaign | Reuse themes while removing legacy challenge menu and monkey-patched rules |
| RW-P08 | Use a compact, explorable alternate Beginnersville containing a guide-self and a few visible others | Readable first arrival without requiring a full NPC/party engine |
| RW-P09 | Use **Will / Echoes / Anchors** as the working three-tree model, keeping **Treasury** and **Structures** as significant Anchors paths | Three memorable ways to master time, without a bland Currency multipliers tree; [details](upgrade-trees.md) |
| RW-P10 | Preserve **Will / Echoes / Memory / Dominion** as a complete four-tree alternative | Dominion could earn top-level status if intertimeline economy and infrastructure justify it; [comparison](dominion-alternative.md) |
| RW-P11 | Give one first meaningful upgrade choice in the nexus, with no permanent class lock, and permit later cross-tree synergies | Different second-run playstyles; shared free ~10× speed remains universal; [contracts](upgrade-tree-contracts.md) |
| RW-P12 | Historical Commerceville potion-finale exploration, superseded as the primary ending direction by RW-Q17 on 2026-11-06 | Owner selected a shorter Valley capstone; preserve the alternatives study as evidence only |

## Unresolved questions — priority for further design

| ID | Question | Current leaning / options | Blocking scope |
| --- | --- | --- | --- |
| RW-Q01 | Which **legacy prestige effects** are worth retaining and how are preexisting purchases treated? | **Hybrid**: remap only useful effects; convert/restored old invested value fairly; retire old UI | Legacy migration and permanent upgrade tuning |
| RW-Q02 | What happens to the **90 old points**, unused points, prior completions and repeated Restore Time achievements? | Avoid directly importing 90 points per run as the new currency by assumption; no double award; show existing veterans an appropriate starting grant | Currency and migration |
| RW-Q03 | Do **Mana Drought**, **Noodle Arms**, **Mana Burn** or other old challenge variants return? | Rebuild only those that add interesting distinct choices, or discard; don't preserve as separate bonus-less menu | Challenge system/legacy save |
| RW-Q04 | How does the ~10× base rate **stack** with gameSpeed, offline time, Chronomancy, Imbue Soul, challenge rules and frame budgets? | Keep separate from earned multipliers; define before implementation with real game/predictor parity tests | Replay speed architecture |
| RW-Q05 | What exact act of **drinking the potion** commits first entry, and how is it distinguished from Valley completion and a new-timeline reset? | Potion entry approved; action trigger, prerequisite and repeat use are open | RW01 UX and state transitions |
| RW-Q06 | How can a player return to a possibly **unfinished original timeline** after visiting Real World, and when is it archived? | Preserve until voluntary new-timeline start; define safe return/retention behavior | Save lifetimes |
| RW-Q07 | Who is the self who notices the newcomer, and how much do they know? | An apparently experienced guide with incomplete knowledge; actual personality/dialogue open | RW01 narrative |
| RW-Q08 | How are future selves **earned and differentiated**? | Distinct achievements/build/choices rather than every clear producing an NPC | Roster and challenges |
| RW-Q09 | What is the permanent **currency and pricing** model? | Avoid grindy small buffs; milestone rewards/choice-based upgrades first; rates need pacing tests | Upgrade system |
| RW-Q10 | Which parts of the original campaign can automation bypass, and which retain player agency? | Gradually automate mastered repetition; don't automate first discovery or full game before mastery | Automation |
| RW-Q11 | Does the name **Real World** literally mean outside a simulation, or outside time? | Keep ambiguous; no "your past game wasn't real" assertion at first meeting | Lore/art/marketing |
| RW-Q12 | How much pixel art belongs in the initial slice? | Two character sprites, one small hub and portal/environment effects; expand original-world art separately | Art scope/performance |
| RW-Q13 | Are there **three** primary trees (Will/Echoes/Anchors) or **four** (Will/Echoes/Memory/Dominion)? | Three currently recommended; four viable if economic progression supports its own deep set of capabilities, not just gold multipliers | Nexus upgrade architecture and onboarding |
| RW-Q14 | How are **initial skill points** granted and used relative to a later free lasting upgrade choice? | Grant an early allocation without assuming an existing skill-point ledger or a specific tree lock | RW02 grant economics |
| RW-Q15 | How are **Memory, Treasury and Structures** balanced across the reset scopes, priced and potentially split into Dominion without save loss? | Stable per-ability IDs, independent lifetime/caps, limited gold/mana transfer, anti-duplication; no numeric policy yet | Nexus economy, RF02 migration and future taxonomy |
| RW-Q16 | How are rewinds, conditional Echo tasks and cross-tree synergies made safe/deterministic? | Read-only forecast, one committed fork, explicit budget/stop conditions, no double grants | Predictor, RF01/RF03 and later ability implementation |
| RW-Q18 | Which authentic potion-drinking requirements and alternate paths lead to Real World without requiring Valley? | Potion required for entry; exact access for the shadow/Startington route and optional knowledge shortcuts need design | RW00/RW01 acquisition |
| RW-Q19 | How do **drink-to-enter** and existing **Totem → Wunderkind** potion uses coexist? | Separate player-controlled uses; no duplicate consumption or inferred crafting from `storyMax` | Inventory, saving and story |
| RW-Q21 | How are partial Valley/tower/trial saves and old prestige entitlements preserved under shorter-Valley tuning and potion-first entry? | Keep the ninth zone and existing progress; protect old saves with explicit compatibility | RF01/RF02 and migration |

| RW-Q28 | What do first-rerun **skill points** actually allocate? | New outer points or bounded grants to existing skills; choose only after inspecting existing skill/XP rules | RW02 state and UI |
| RW-Q29 | What exactly is the **major temporary boost**, and when does it expire? | Strong but bounded, distinct from free 10× speed, with explicit cap/stacking and an in-game expiration indicator | RW02 pacing and predictor |
| RW-Q30 | How much exploration and social interaction precedes the first rerun? | Several other selves visible, one initiates brief recognition dialogue, small optional interactions | RW01 scope and art |
| RW-Q31 | What defines timeline **completion and entitlement settlement** when potion entry precedes optional Valley/Restore Time? | Separate first arrival, Valley ending, timeline close and first-rerun grants; no duplicated prestige payouts | RW02 and veteran migration |
| RW-Q32 | When do **parties** become available, and what is a party versus a passive NPC roster? | Social discovery first; functional party formation/management in RW05 | Later UI and gameplay |

## Change control and conflicts

The [potion/endgame research](potion-and-endgame-options.md) is historical evidence. **Drinking the Looping Potion to enter Real World is now approved product direction; dropping Valley is not.** The potion is *not* required to complete Valley or the existing `RestoreTime`. RW-D02's previous portal requirement was explicitly superseded; current code remains unchanged. Both reputation paths and old saves need future tests.

The proposed retirement of legacy challenges affects **RF04**, whose previously documented refactor charter would preserve existing modes while removing monkey-patching. That is still a valid *intermediate compatibility refactor*, but should not be executed simply because it was planned if the product will instead retire/reframe these modes. See [RF integration](integration-with-refactoring.md). Do not silently change approved RF charters in this design-only effort.

The **exact** 10× factor is a target experience, not a chosen implementation formula. The intent is a powerful immediate difference after the first campaign, independently of purchased upgrades. It may require tuning to avoid saturating the browser tick loop or breaking time-sensitive gates.

When a question is answered, record the date, choice, rejected alternatives and changed documents here. New product decisions do not authorize a merge or edit of gameplay code.
