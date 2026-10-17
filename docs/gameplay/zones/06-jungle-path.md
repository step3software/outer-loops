# Zone 6 — Jungle Path

**11 actions.** This area is a short, consequential combination of jungle exploration, combat ranks, survivors and branching travel.

## Gameplay dependencies

- `Explore Jungle` progresses the route; `Fight Jungle Monsters` is multipart with its own named rank ladder and progression multiplier.
- `Rescue Survivors`, `Prepare Buffet` and `Totem` use jungle resources and group-oriented progression; their gates can interact with prior combat, skills and temporary inventory.
- `Escape` unlocks at Explore Jungle level 100 (visible at ≥75). The first `canStart` evaluation succeeds and sets `escapeStarted` only if `effectiveTime < 60`; after that flag is set it can remain startable within the run. This is a meaningful *side effect in an eligibility predicate*. See risk [R08](../../audit/findings.md).
- `Open Portal` requires Restoration ≥1,000 plus global Explore ≥75; it returns **6→1**, enabling a backward route. The player's planned queue and `getPossibleTravel` must account for negative travel deltas.
- `RuinsZ6` / `HaulZ6` supply the fourth tower stone origin.

## Regression boundaries

Timed Escape should be checked before/after exactly 60 effective seconds, with queued actions before it and skipped costs. Test failed start and future eligibility, jungle rank/floor rewards, portal return, backtracking queues, and story ordering. `Escape.story` contains a source FIXME about later global story unlocking an earlier Looping Potion story.
