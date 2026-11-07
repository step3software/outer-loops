# Narrative — potion arrival in alternate Beginnersville

**Status:** Potion-first entry, retained faster Valley, several visible alternate selves, one newcomer-recognition conversation and a first empowered rerun are **approved product direction** (2026-11-06). Actual dialogue, lore, UI details, skill-point mechanics and temporary-boost rules are **proposed**. No Real World gameplay has been implemented.

## Existing canon, independent of the new route

The protagonist starts as a **courier** whose broken delivery releases the mysterious liquid that traps them in repeating days (English global story 0 in `lang/en-EN/game.xml`). The same substance can be recreated as the **Looping Potion** on Mt. Olympus. Its **current** game use is at Jungle Totem for Wunderkind experience, not travel to another reality.

`Action.RestoreTime` is the existing independent climax in Valley of Olympus: its story describes weaving broken strands into distinct lives, including a Witch's friend and a crafter. Preserve that narrative, the original authors' credits and the selected **faster Valley** direction. **The player does not need to complete Restore Time before entering Real World.** This lore can inform later relationships but should never silently gate the potion entry.

## First arrival — approved story beats

1. **Recreate the Looping Potion.** The player earns genuine potion access through a legal progression path. Existing Valhalla Spatiomancy and the bypassing shadow path require separate future access design.
2. **Choose to drink it.** This deliberate reality transition is a distinct use from the existing Totem/Wunderkind action, ordinary inner-loop restart and Jungle `OpenPortal`. Crafting alone does not transport the player.
3. **Arrive in another Beginnersville.** Familiar geography and landmarks look a little wrong; the village contains **several alternate versions of the protagonist**. It is a separate outer scene, never a replacement for ordinary town 0.
4. **Be noticed.** One self recognizes the newcomer and initiates a brief conversation. Others are present as inhabitants, not immediate selectable party units.
5. **Explore.** The player can inspect a small number of approachable locations or interactions before committing to a new timeline. No massive tutorial tree or automatic loss of their current original-world run.
6. **Choose a first rerun.** The player receives **initial skill points** and a **major temporary boost**, plus the free permanent **~10× replay acceleration** and an early pathway to lasting upgrades. Exact economy, boost, timing, expiry and UI remain to be designed.
7. **Return and discover more.** Replays gradually expose advanced skills, automation, more selves, key-configured timelines, wagers and **party-based play**, as those systems become useful.

## First recognition conversation — draft dialogue only

*The potion tastes familiar. For a moment you expect the usual reset. Instead, the village appears around you: the same road, the same square, but the people are wrong. Every face you turn toward looks strangely like your own.*

*One of them notices you standing still. They leave a conversation and approach.*

**Other You:** “Oh. You're new.”

**You:** “This is Beginnersville.”

**Other You:** “Yes. And also not quite.”

**You:** “Why do you look like me?”

**Other You:** “You really are new.”

*Behind them, two more familiar strangers pass one another as though this is entirely ordinary.*

**Other You:** “Go have a look around. When you're ready, I'll show you how to go back. The good news is, you won't have to start with nothing.”

The first guide's name, knowledge, motives and the true nature of Real World are deliberately unresolved. Nothing should imply the earlier world was fake or that all visible selves completed Valley.

## Agency and replay rewards

Potion arrival, the first greeting, a later voluntary **Start New Timeline** and the first skill-point/boost entitlement are **separate once-only transitions**. Drinking again, refreshing, leaving or replaying dialogue must not duplicate benefits. Preserve the current original-world timeline until the player knowingly commits to resetting it; it may include unfinished Valley progression.

The initial **skill points** are a requested first-rerun reward, **not automatically legacy prestige points** or a preexisting core-game skill-point ledger. A **large temporary boost** is a second distinct reward with an explicitly bounded expiration once approved; it is not a hidden extra ×10 speed multiplier. Give the player enough explanatory UI to understand what was received without a long tutorial.

The first guide can later become a useful companion, but party recruitment and delegation belong to later progression. The village should first feel *inhabited*; richer systems, including [RW06/RW07 proposals](https://github.com/step3software/outer-loops/pull/9), should emerge gradually.

## Story and technical boundaries

Do not rewrite `RestoreTime`, its credits, existing story indexing or old save records in this documentation task. The potion-to-Real-World event has no current source implementation; exact consumption and location are future decisions. Preserve the existing Totem and both high/low-reputation route options, and avoid relying on `storyMax` to prove a real potion was crafted.

See the [decision ledger](decisions.md), [potion source analysis](potion-and-endgame-options.md), [timeline architecture](technical-architecture.md), [first-visit art brief](visual-direction.md) and [future verification](validation.md).
