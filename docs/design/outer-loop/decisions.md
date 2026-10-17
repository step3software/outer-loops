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

## Endgame reconsideration — under discussion, no new approval

The [potion and Valley alternatives](potion-and-endgame-options.md) document an **as-coded** fact: Looping Potion can be made before Valley of Olympus (after Valhalla-derived Spatiomancy), consumed at Jungle Totem for Wunderkind, and **does not gate Restore Time**.

The recently explored possibility of **retiring Valley as a playable region** and giving the potion a central role in a short finale is a **proposal**, not an instruction to remove zone 8. If selected, it changes the location/requirements of the ending and must **explicitly revise RW-D02**, which currently assumes the existing Restore Time climax. Until that decision, keep RW-D02, original nine-zone mechanics, and source-grounded audits as coded. The alternatives are: **A unchanged Valley**, **B condensed Valley**, **C commerce-city potion/temporal capstone** (recommended for exploration). "Potion required" also threatens access for the low-reputation route unless an equivalent dark-path solution is provided.

## Working tree design direction (documented, not finalized)

The **recommended** player-facing structure is **Will / Echoes / Anchors**. Will grants deliberate active control; Echoes grants conditional automation and delegation; Anchors retains bounded knowledge, **Treasury/economic value**, and infrastructure across chosen reset boundaries. There is **no** separate default Currency tree or second legacy prestige shop. Documented starting examples: **Pivot / First Apprentice / Anchored Memory**, in addition to the agreed free ~10× replay acceleration. Cross-tree synergies include **Adaptive Intervention**, **Persistent Workshop**, and **Fixed Point**. See [three-tree design](upgrade-trees.md).

**Not ruled out:** a **four-tree architecture (Will / Echoes / Memory / Dominion)** that separates learned progress from economic ownership and infrastructure. Dominion is a serious independent tree, not a renamed minor currency multiplier. See [the complete alternative](dominion-alternative.md). The user requested **both** documented, and the choice of final tree count is still open. No upgraded node, starter grant, mastery gate, cap, synergy or refund policy is implemented or finalized.

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
| RW-P09 | Use **Will / Echoes / Anchors** as the working three-tree model, keeping **Treasury** and **Structures** as significant Anchors paths | Three memorable ways to master time, without a bland Currency multipliers tree; [details](upgrade-trees.md) |
| RW-P10 | Preserve **Will / Echoes / Memory / Dominion** as a complete four-tree alternative | Dominion could earn top-level status if intertimeline economy and infrastructure justify it; [comparison](dominion-alternative.md) |
| RW-P11 | Give one first meaningful upgrade choice in the nexus, with no permanent class lock, and permit later cross-tree synergies | Different second-run playstyles; shared free ~10× speed remains universal; [contracts](upgrade-tree-contracts.md) |
| RW-P12 | Investigate a **shorter potion/temporal research capstone after Jungle Path, likely in Commerceville**, instead of repeating the original 1,000-stone Valley grind | Leverages the origin-story potion while preserving a meaningful ending and late-game economy; [comparison](potion-and-endgame-options.md). **Not approved for gameplay** |

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
| RW-Q13 | Are there **three** primary trees (Will/Echoes/Anchors) or **four** (Will/Echoes/Memory/Dominion)? | Three currently recommended; four viable if economic progression supports its own deep set of capabilities, not just gold multipliers | Nexus upgrade architecture and onboarding |
| RW-Q14 | Is the first upgrade **free**, one-of-three/four and eventually cross-purchasable; which abilities ship? | Pivot / First Apprentice / Anchored Memory; optional fourth starter Timeless Treasury; final charge/goal/retention semantics not set | First compelling second playthrough |
| RW-Q15 | How are **Memory, Treasury and Structures** balanced across the reset scopes, priced and potentially split into Dominion without save loss? | Stable per-ability IDs, independent lifetime/caps, limited gold/mana transfer, anti-duplication; no numeric policy yet | Nexus economy, RF02 migration and future taxonomy |
| RW-Q16 | How are rewinds, conditional Echo tasks and cross-tree synergies made safe/deterministic? | Read-only forecast, one committed fork, explicit budget/stop conditions, no double grants | Predictor, RF01/RF03 and later ability implementation |
| RW-Q17 | Does **Valley of Olympus remain**, become a short capstone, or cease to be a playable area? | **A** unchanged; **B** condensed; **C** replace with brief potion/temporal research finale in Commerceville. **C** recommended for exploration, not approved | Endgame, zone topology, story, save migration, RW-D02 |
| RW-Q18 | Is **Looping Potion creation/understanding** part of the new required finale, or optional narrative/mastery content? | Strong narrative candidate; retain alternative legal route for players who bypass Valhalla; don't merely replace tower grind with repeated potion brewing | First completion accessibility, two reputation branches, stage gates |
| RW-Q19 | How does the potion's existing **Jungle Totem → Wunderkind** use interact with a new finale? | Prefer optional stat-training use plus a separate earned-knowledge/ritual milestone; never depend on global `storyMax` alone due to source FIXME | Potion inventory, story flags, buffs, save/loop reset |
| RW-Q20 | What replaces the tower, gods, temporal-stone hauling and `ImbueSoul` finale dependencies if Valley is retired? | Preserve a memorable climax, purposeful earlier exploration, appropriate optional trial/imbuement routes; no silent orphan content | Old content, SurveyZ8 divisor, SecretTrial gate, credits |
| RW-Q21 | How should **current Valley/partial tower/old prestige saves** migrate under a shortened or removed ending? | Versioned non-destructive compatibility layer and veteran entitlement treatment; no physical zone-index removal without regression proof | RF01/RF02, import, action loadouts, story numbering, refund/credits |

## Change control and conflicts

The [potion/endgame reconsideration](potion-and-endgame-options.md) creates a second major decision boundary: **do not treat dropping Valley or making potion mandatory as already adopted**. Doing so would require explicitly revising the approved RW-D02 ending transition and testing two reputation branches plus old-save compatibility.

The proposed retirement of legacy challenges affects **RF04**, whose previously documented refactor charter would preserve existing modes while removing monkey-patching. That is still a valid *intermediate compatibility refactor*, but should not be executed simply because it was planned if the product will instead retire/reframe these modes. See [RF integration](integration-with-refactoring.md). Do not silently change approved RF charters in this design-only effort.

The **exact** 10× factor is a target experience, not a chosen implementation formula. The intent is a powerful immediate difference after the first campaign, independently of purchased upgrades. It may require tuning to avoid saturating the browser tick loop or breaking time-sensitive gates.

When a question is answered, record the date, choice, rejected alternatives and changed documents here. New product decisions do not authorize a merge or edit of gameplay code.
