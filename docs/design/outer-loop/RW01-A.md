# RW01-A — Outer Loop Mode, Activities and Bidirectional Travel

**Lifecycle:** Proposed milestone; no plan approval or implementation authorization.
**Owner origin:** 2026-11-07 owner request for three interaction-system milestones, following confirmed potion, mana-free mode and travel rules.
**Repository:** `step3software/outer-loops` at `main` revision `860872f7db08a1870d33f6105a5d9aae40ea5f18`.
**Dependencies:** Existing RF01 coverage; [RW01-B](RW01-B.md) follows; [RW02](RW02.md) handles timeline reset.

## Objective

Provide a separate, navigable **Outer Loop** mode and shared contextual-activity foundation without changing the original 157-action, nine-town mana-queue game.

## Product contracts and scope

- **Approved:** Drink one held Looping Potion from **any original-world location** to enter Outer Loop. The Jungle Totem instead consumes one potion for Wunderkind; the same potion cannot satisfy both, but another may be brewed.
- **Approved:** Outer Loop actions do **not** cost mana; most original-world actions disappear in this mode; travel between outer locations works **in both directions** wherever adjacent locations exist. Preserve original-world travel and economy.
- Implement a mode/location controller outside `Town(0..8)` with a minimal, game-native UI and a reusable contextual-activity registry: stable ID, mode/location, eligibility predicates, event hooks and validated effects.
- Pause—not clear or silently process—the inner-loop action queue and mana clock during Outer Loop activities; prevent stale queued actions from executing across mode changes.
- Give all nine named locations reversible Outer Loop navigation edges, including branch and end nodes, without granting original-world unlocks by traveling.
- Persist current mode, location and transition receipts through save/load, export/import and snapshot boundaries. Preserve potentially unfinished Valley, prior skill/town progression and the existing queue; do not auto-start a new timeline.
- **Open:** Initial outer destination after drinking outside Beginnersville; exact pre-commit return/resume UX; complete reduced activity catalog. Recommended entry default is the matching Outer Loop location, not an owner decision.

## Exclusions

No new ordinary town, changed original action costs or identifiers, NPC conversation content, story rewards, first-rerun grants, reset/migration of old prestige, Valley shortening, new UI framework, full RPG movement or artwork production.

## Acceptance criteria

- **RW01-A-AC01:** Drinking is available with an actually held potion in all nine original locations, consumes exactly one on successful entry, and cannot run without possession or from a story flag alone.
- **RW01-A-AC02:** Existing Totem use still consumes one held potion for Wunderkind; a single potion cannot serve both uses, and legitimate rebrewing remains possible.
- **RW01-A-AC03:** On entry, original-world queue, resources, progression, unfinished Valley and first-rerun entitlement remain recoverable; no timeline reset occurs.
- **RW01-A-AC04:** The inner mana queue/timer does not execute in Outer Loop mode, and only eligible Outer Loop activities are shown/dispatchable at zero mana cost.
- **RW01-A-AC05:** Travel between adjacent Outer Loop locations works in both directions and handles branch/end locations without relying on original one-way travel gates.
- **RW01-A-AC06:** Each contextual activity has stable identity and deterministic eligibility/effect processing; invalid events cannot partially mutate persistent state.
- **RW01-A-AC07:** Mode/location/consumption are consistent across save, reload, export, import and interrupted entry; older saves default safely to original-world mode.
- **RW01-A-AC08:** Nine-town indices, original `Action.*` keys, Valley/Restore Time, predictor assumptions and normal action gameplay remain compatible.
- **RW01-A-AC09:** The mode and travel UI use the game's existing theme, panels, typography, keyboard affordances and narrow-screen behavior.

## Verification and handoff

Plan dedicated mode/potion/travel/eligibility/restart/save regression fixtures and isolated-browser tests, while retaining `npm run check`, model/action/RF01/RW00 and browser smoke coverage. Check original-mode predictor parity. These checks **have not been run** for this proposal. RF02 recovery protections gate later destructive timeline resets, not this proposal's authority.

**Planning boundary:** This is review material only, not a source edit, stage acceptance, merge or deployment grant.
