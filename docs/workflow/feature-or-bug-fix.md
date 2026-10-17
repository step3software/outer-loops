# Agent thread prompt: feature or bug fix

Use this as a reusable request for an AI coding session. Replace bracketed parts with the specific task.

> Repository: `https://github.com/step3software/outer-loops`
>
> Read `AGENTS.md`, `docs/README.md`, and the relevant source/system guides first. Use the current `dmchurch` branch as the base and create a focused branch. Do not merge.
>
> **Goal:** [player-visible outcome or bug]
>
> **Reproduction/current behavior:** [actual observation or reference]
>
> **Expected behavior:** [testable acceptance conditions]
>
> **Constraints:** Maintain existing action identities, saves, zone numbering, loop/prestige boundaries, localization, and predictor behavior unless the goal explicitly changes them.
>
> Inspect implementation before editing; keep the patch targeted. Update `docs/` and the action catalog when applicable. Run `npm run check` and XML validation, then perform affected browser smoke tests if available. Open a PR against `dmchurch` with an implementation summary, real test evidence, any unverified behavior and compatibility risks. Ask only for decisions that genuinely block implementation.

## Agent acceptance note

A task is not finished merely because a file changed. The PR should make it straightforward to validate the precise gameplay difference, know which saves and modes were exercised, and identify regressions.
