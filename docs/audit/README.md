# Technical and gameplay review

## Baseline and method

**Baseline:** step3software/outer-loops, default branch `dmchurch`, commit `fe4a349efb799a56ab548018caca1a1a1aea0c8f`. This review builds on the AI-development documentation branch. Date: 2026-10-17.

This is a **source-grounded technical and gameplay audit**, not a claim of full playthrough or mathematically proven game balance. Source was inspected through the repository and its current executable modules. The entire registry was instantiated in a worker-like Node VM so that all 157 actual action objects, including dynamically constructed factory actions, could be catalogued. Remaining observations are distinguished as code-confirmed, plausible risk or judgment requiring gameplay observation. Third-party minified libraries, every line of narrative XML and visual rendering were not exhaustively manually inspected.

## Review outputs

- [Technical assessment](technical-review.md) — architecture, lifecycle, subsystems, architecture debt and system-specific constraints
- [Gameplay assessment](gameplay-review.md) — primary and late-game loops, onboarding, pacing, challenges, predictor and economy
- [Progression and zone routing](progression.md) — gates, travel graph, alternative paths and endgame
- [Balance and formulas](balance-formulas.md) — XP, talent, combat, mana, limited resource supply, prestige and investment
- [Persistence contract](persistence-contract.md) — save fields, migration paths, state lifetime and destructive operations
- [Findings register](findings.md) — evidence, severity, confidence, concrete reproduction/acceptance steps
- [Coverage and test evidence](coverage.md) — what was checked, exercised, and explicitly **not** verified
- [All 157 action mechanics](../reference/action-mechanics.generated.md) — runtime-generated per-action conditions, stats, callbacks and links to executable definitions
- [Simple action catalog](../reference/action-catalog.md) — compact index by zone

The existing [architecture](../architecture.md), [gameplay](../gameplay.md), [state and saving](../state-and-saving.md), [predictor](../predictor.md), [content editor](../content-editor.md), [UI and localization](../ui-and-localization.md), [code map](../reference/code-map.md) and [testing workflow](../development/validation.md) remain the operational guides.

## Source coverage convention

| Level | Meaning |
| --- | --- |
| **Indexed** | File and symbols identified and location recorded |
| **Inspected** | Representative or critical execution paths reviewed |
| **Model-tested** | Real source evaluated under isolated worker-like Node VM with assertions |
| **Static-validated** | JS syntax, linked assets, Markdown links, action inventory or XML parsing checked |
| **Browser-tested** | A browser interaction actually executed and result observed |

No file should be labeled browser-tested without actual browser evidence. A deterministic model test can establish a formula or registry invariant but cannot establish full UI, cloud, action sequencing under real timing, or backward compatibility.

## Main conclusions

1. The nine-zone action/progression system is materially richer than the earlier Lloyd fork. The primary engine is mutable-global classic JavaScript with important coupling between actions, tick/queue, saves, rendering and predictor.
2. Save compatibility and challenge/prestige boundaries are the highest-risk areas for unreviewed changes. The effective source of truth is `actionList.js`, while `data/actionList.xml` is an experimental editor input.
3. The main player loop is plan → execute under mana/time constraints → retain long-term progress → revise the next action sequence. Later zones add guild rankings, combat, resource conversion, story gates, limited discoveries, investment, alternate routes and prestige.
4. The game currently lacks a real browser integration suite and historical save fixtures. Static validation and worker-like model checks are a strong *floor*, not full verification.
5. No recognized software license was identified in the fork metadata or root tree. This constrains assumptions about external distribution/commercialization independently of technical feasibility.

## Scope and review protocol

This review documents **as-is** mechanics, highlights hypotheses and prioritizes validation. It does **not** alter economy, behavior, save formats, cloud integration or the release pipeline. Every proposed fix belongs to a separate scoped implementation PR with regression evidence. Review findings in [findings](findings.md) before significant development.
