# Visual design — a small pixel-art Real World

**Status:** Direction approved for Outer Loops; concrete assets, resolution, animation budget and UI arrangement are **provisional**. This is a visual brief, **not** a request to generate images or alter the game UI now.

## Visual premise

The current game is primarily an abstract, information-dense sequence of queues, menus, resources and stat bars. The first potion drink brings the player to a **pixel-art version of Beginnersville that is recognizably familiar but different**, inhabited by **several alternate selves**. One notices the newcomer and approaches. The village can grow with deeper systems without first replacing all original-world artwork.

**Art mood:** intimate, mysterious, slightly uncanny, warm enough to invite return visits. Avoid "generic multiverse sci-fi", shiny AI-generated fantasy sludge, or an overwhelming character hub filled with buttons.

## Initial alternate Beginnersville scene (concept)

```text
Familiar village skyline / strange light
   houses    square     stall / gathering place
      other self     player    another self
                        ^
                     guide-self approaches
   inspect village      speak      start a new timeline (later)
```

This is a **composition sketch**, not a request to build a new RPG engine, committed camera layout or final asset set. The scene may use simple focusable hotspots or limited movement and should remain understandable as a **single screen** with optional detail views.

### Minimum first-arrival visual scope

- A compact **Beginnersville-inspired** environment with recognizable landmarks and subtle differences marking Real World as a separate place, not normal `Town(0)`.
- A distinctive player sprite and **one recognizable guide-self** with an approach/greeting beat.
- **Several visible alternate selves** (a few restrained idle/background silhouettes or sprite variations are sufficient for the first slice). They should feel like inhabitants, not immediately usable party members.
- A clear **potion-arrival transition**, not a compulsory post-`Restore Time` portal or the existing Jungle `OpenPortal`.
- Small optional interactions and legible dialogue before revealing first-rerun point allocation, temporary boost and explicit start action.
- Readable, separate indicators for **permanent free ~10× acceleration** and the first-rerun **temporary boost** once those mechanics are specified.

Do not block first playable validation on unique portraits for every alternate self, a nine-zone art overhaul, pathfinding/collision, combat animations or full party controls.

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

## Tree navigation inside the small nexus

The [working three-tree recommendation](upgrade-trees.md) offers three clear, visually distinct paths: **Will** (deliberate intervention), **Echoes** (delegation), and **Anchors** (what survives time). **Treasury** is a prominent Anchors specialization, *not* a token-sized footnote. The [four-tree alternative](dominion-alternative.md) offers **Memory** and **Dominion** as peers. Do not commit the room layout, icon count or four independent structures until that decision is made.

The first guide-self should **recognize the newcomer and invite exploration**, not immediately narrate every tree. Introduce the available first-rerun points/temporary boost when relevant, and reveal three or four upgrade-tree choices only when the player reaches that progression decision. Cross-tree synergy links might be illustrated by connected threads later. The UI should distinguish **automatic free ~10× replay speed** from any purchased tree effect and display what a first upgrade *does*, not just its name.

## Growth with progression

As more distinct selves become meaningful, the alternate village can evolve: new conversations, workstations, gathering areas, party planning locations and memories tied to mastered systems. **Expansion should follow actual capabilities**, not pad the hub with decoration. Multiple selves should remain individually recognizable, and important interactions shouldn't be buried in visual clutter.

The room can also convey the distinction between **one active timeline** and **archived completed ones**, perhaps with one bright strand and several dimmer strands. These are narrative/UI metaphors, not committed save structures.

## Boundaries with the wider game's art roadmap

The user's broader goal is a pixel-art graphic style throughout Outer Loops. That is a **parallel** visual workstream:

1. Define art bible and performance/accessibility constraints using this nexus as a proof of style.
2. Establish pixel-art asset pipeline and compatibility with current HTML/JS rendering.
3. Expand to icons, menus and later zone imagery by priority, without modifying existing action identifiers or gameplay.
4. Never force a full 157-action visual redesign to block a functioning outer-loop MVP.

Treat all currently displayed game graphics/assets as existing works with their own provenance/rights. The repository has no verified comprehensive source license; new artwork licensing and rights must be recorded before a public release. See [upstream rights note](../../reference/upstream-and-rights.md).

## First-visit user experience criteria

Players should quickly recognize **several other versions of the protagonist**, see **one notice and address them**, and recognize the surrounding village as a changed Beginnersville. The scene should remain coherent on desktop and narrow viewports, and support keyboard access. Conversations and upgrades should be legible without needing to infer meaning from tiny pixel details. The protagonist can leave, return, and revisit the other self. No mandatory wall of menus or automatic timeline reset upon arrival.

The exact mockup and art source files require a later, explicit artwork/design request.
