# RW01-B — Event-Driven NPCs and Game-Native Conversation UI

**Lifecycle:** Proposed milestone; no plan approval or implementation authorization.
**Owner origin:** 2026-11-07 request for the approaching Other You, dialogue choices, and a mockup visually close to the existing game.
**Repository:** `step3software/outer-loops` at `main` revision `860872f7db08a1870d33f6105a5d9aae40ea5f18`.
**Dependency:** [RW01-A](RW01-A.md) supplies mode, contextual activity and location interfaces; [RW02](RW02.md) follows.

## Objective

Produce a fully playable, replay-safe **Other You** introduction in Outer Loop Beginnersville with reusable NPC, triggered-event and branching-dialogue systems rather than hardcoded one-off queue actions.

## Product contracts and scope

- **Approved:** Several alternate selves already inhabit outer Beginnersville. One notices the newcomer and approaches; the player can speak and explore before voluntarily starting a new timeline.
- Add character identities/locations, a bounded deterministic event dispatcher (enter location, first visit, action completed, conversation choice) and once-only event receipts.
- Separate **Other You approaches** (trigger) from **Talk to Other You** (player interaction) so dialogue can be dismissed and revisited without retriggering the first approach.
- Add declarative dialogue nodes with stable IDs, localized speaker/text/choice keys, guarded conditions, safe whitelisted effects, branching targets and resumable state. No arbitrary code execution from dialogue data.
- Integrate a compact dialogue panel and response buttons into the existing town/actions presentation using current CSS variables, familiar green buttons and `view.requestUpdate`; preserve original queue/stat panels instead of importing a new frontend framework.
- Persist encounter and conversation progress without duplicate effects after reload, interrupted navigation or repeated interaction. Include keyboard, focus, theme and narrow-screen behavior.
- **Recommended, not settled:** A dismissible approach notice before the first dialogue; the guide's precise identity, text and optional early explorations remain open content choices.

## Exclusions

No party recruitment or self-management, concurrent NPC simulations, RPG pathfinding, many bespoke characters, new generated-art assets, free-form AI dialogue, external service, temporary boost, skill-point grant or new-timeline reset.

## Acceptance criteria

- **RW01-B-AC01:** The first eligible arrival at Outer Loop Beginnersville (regardless of potion-use location) triggers exactly one approach from the first Other You.
- **RW01-B-AC02:** Several distinct selves appear as contextual inhabitants, not extra original-world queue actions or automatic party units.
- **RW01-B-AC03:** A conversation offers at least three selectable responses producing observable branches under validated choice eligibility.
- **RW01-B-AC04:** The player can dismiss, resume, revisit and finish dialogue, continuing location exploration and bidirectional travel without getting trapped.
- **RW01-B-AC05:** First-meeting receipts, selected responses and any once-only effects survive save, reload and export/import without repetition.
- **RW01-B-AC06:** Character, event and dialogue definitions use stable serializable IDs and localized content; adding another simple conversation requires no new core queue special case.
- **RW01-B-AC07:** UI preserves the recognizable three-column game layout, established colors/fonts/buttons, accessible focus, keyboard choices and mobile/narrow behavior.
- **RW01-B-AC08:** Dialogue/event code cannot advance original-world actions, grant rewards on display alone, bypass eligibility or alter original game saves/predictor outcomes accidentally.

## Verification and handoff

Add deterministic event-order, once-only, branch, malformed-definition, interruption and resume tests plus isolated-browser first-arrival, navigation, keyboard, theme and save/reload checks. Reuse the project's RF01/RW00/normal-browser regressions. **No implementation or tests have been performed** by this document.

**Planning boundary:** This remains a proposed milestone; it does not accept a stage, authorize implementation, merge or release.
