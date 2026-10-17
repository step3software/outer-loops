# Visual design — a small pixel-art Real World

**Status:** Direction approved for Outer Loops; concrete assets, resolution, animation budget and UI arrangement are **provisional**. This is a visual brief, **not** a request to generate images or alter the game UI now.

## Visual premise

The current game is primarily an abstract, information-dense sequence of queues, menus, resources and stat bars. Real World is an opportunity for a striking contrast: **an inhabitable, quiet pixel-art place outside time**, where the player sees their first alternate self face to face. This anchors the eventual pixel-art makeover without requiring an enormous asset sprint before the nexus concept works.

**Art mood:** intimate, mysterious, slightly uncanny, warm enough to invite return visits. Avoid "generic multiverse sci-fi", shiny AI-generated fantasy sludge, or an overwhelming character hub filled with buttons.

## Initial single-screen scene (concept)

```text
+----------------------------------------------------------------+
|                    threads / still sky                         |
|                                                                |
|      doorway to your      TWO SELVES              loom /       |
|      completed timeline  Player   Other You        tapestry    |
|           [portal]         @       @                [threads]   |
|                                                                |
|     return to world       talk/interact        outer abilities |
|                                                                |
|            --- quiet floor, sparse scenery ---                  |
|                 Start a New Timeline                            |
+----------------------------------------------------------------+
```

This is a **layout sketch**, not a committed screen ratio or final game UI. Early interaction may be point-and-click with accessible keyboard focus rather than a complex character movement controller. "Navigable room" is an experiential goal; arrow-key movement is not automatically required.

### Minimum art scope for an initial playable hub

- One compact environment/background depicting an unusual, timeless threshold.
- **Two recognizable versions of the same protagonist**. Distinct clothing/pose and subtle animations, but clear shared face/silhouette.
- A visual **portal/doorway** corresponding to the *new* post-Restore Time threshold, distinct from the existing Jungle Path `OpenPortal` action.
- A restrained **threads/loom/tapestry** focal object tying the scene to the original story.
- A small, consistent interaction/upgrade/navigation treatment, including a readable 10× replay indicator.
- Minimal ambient motion (e.g. threads drifting, soft character idle), with options for reduced motion.

No additional NPC roster, nine-zone background set, full combat animation suite, detailed walk cycle, asset atlas or cinematic cutscene is required for the first playable validation.

## Pixel-art style considerations to resolve

| Dimension | Preliminary recommendation | Open decision |
| --- | --- | --- |
| Tile / sprite scale | Explore a consistent low-resolution tile/sprite grid such as 16 px or 32 px units, scaled with nearest-neighbor rendering | Choose after mockups and usability tests |
| Character readability | Simple silhouettes and limited palette, with personality from small recognizable details | Final protagonist look |
| UI typography | Crisp, legible menus; pixel-style heading font only where it does not impair long instructions | Exact UI font/palette |
| Lighting | Temporal thread effects/contrasts rather than heavy particle/glow shaders | Accessible high-contrast alternative |
| Theme connection | Reuse a restrained subset of colors/ornaments in the existing UI over time | How much to visually unify inner and outer worlds |
| Animation | Light loops and one strong arrival beat; avoid distracting activity during planning | Motion/fps budget |
| Accessibility | Keyboard/touch focus, scalable text, non-color-only status, reduced motion | Implementation approach |

A fully animated RPG exploration mode is **not required** to achieve the two-selves revelation. Time spent building a movement/collision engine before the prestige loop functions would be poorly sequenced.

## Growth with progression

As more distinct selves are discovered, the nexus can evolve: new workstations, branching rooms, more threads, an archive wall or small alcoves tied to mastered systems. **Expansion should follow actual capabilities**, not pad the hub with decoration. Multiple selves should remain individually recognizable, and important interactions shouldn't be buried in visual clutter.

The room can also convey the distinction between **one active timeline** and **archived completed ones**, perhaps with one bright strand and several dimmer strands. These are narrative/UI metaphors, not committed save structures.

## Boundaries with the wider game's art roadmap

The user's broader goal is a pixel-art graphic style throughout Outer Loops. That is a **parallel** visual workstream:

1. Define art bible and performance/accessibility constraints using this nexus as a proof of style.
2. Establish pixel-art asset pipeline and compatibility with current HTML/JS rendering.
3. Expand to icons, menus and later zone imagery by priority, without modifying existing action identifiers or gameplay.
4. Never force a full 157-action visual redesign to block a functioning outer-loop MVP.

Treat all currently displayed game graphics/assets as existing works with their own provenance/rights. The repository has no verified comprehensive source license; new artwork licensing and rights must be recorded before a public release. See [upstream rights note](../../reference/upstream-and-rights.md).

## First-visit user experience criteria

Players should immediately recognize that the other person is *also the protagonist*. The scene should visibly differ from the original game, feel coherent at desktop and narrow viewports, and support keyboard access. Conversations and upgrades should be legible without needing to infer meaning from tiny pixel details. The protagonist can leave, return, and revisit the other self. No mandatory wall of menus or automatic timeline reset upon arrival.

The exact mockup and art source files require a later, explicit artwork/design request.
