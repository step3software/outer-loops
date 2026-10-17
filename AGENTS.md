# Agent operating instructions

These instructions apply to the entire repository. Read `docs/README.md`, the [source-grounded review](docs/audit/README.md), and the relevant system guide before making a change; nested `AGENTS.md` files add directory-specific requirements.

## Project identity

Outer Loops is an independently maintained fork of Idle Loops: `step3software/outer-loops`, forked from `dmchurch/omsi-loops`, ultimately descended from `omsi6/omsi6.github.io`. It is a browser-based incremental/time-loop game, not a Node server or bundled SPA. The current default branch is `dmchurch`. Upstream code has no GitHub-recognized license; do not assume commercial reuse rights or add a license without the rights holder's authorization. See `docs/reference/upstream-and-rights.md`.

## Mandatory orientation

1. Read `docs/audit/findings.md` for known hazards; read `README.md` for local launch and `docs/architecture.md` for script ordering and runtime ownership.
2. Locate the smallest source-of-truth surface using `docs/reference/code-map.md`. Search the actual code rather than guessing from UI names.
3. Read the applicable `docs/development/recipes.md`, `docs/state-and-saving.md`, and `docs/development/validation.md` before changing state, actions, saves, or UI.
4. Inspect `git status` and the current branch; work on a feature branch. Never silently replace or rebase others' work.
5. State the expected behavior and regression risks in the PR; preserve the default branch until review.

## Non-negotiable engineering invariants

- `index.html` loads classic scripts in a deliberate sequence. Most game files rely on shared globals; there is no bundler, ES-module import graph, or runtime npm dependency. Preserve load order and the browser/worker distinction. Do not introduce frameworks or package managers as a side effect of a small feature.
- `actionList.js` is authoritative for executable action definitions. The XML under `data/` feeds the separate content editor and does **not** replace live `Action.*` definitions. Consult `docs/content-editor.md`.
- Action `name`, `varName`, keys such as `Action.RaiseZombie`, and the persisted town variable names can be save-file compatibility contracts. Never casually rename or renumber them. Zones are zero-indexed (0–8), with nine names in `townNames`.
- New actions must account for availability/visibility/unlock behavior, cost and reward, stats/skills, queued-action behavior, progress variables, story flags, localization, icons, UI refresh, and predictor implications. Follow `docs/gameplay.md`.
- A loop reset is not a full game reset. Respect persistence boundaries between loop resources, town progress, stats/talents, skills, buffs, story, challenges, prestige, and save storage. See `docs/state-and-saving.md`.
- Prefer existing `view.requestUpdate(...)` paths to ad hoc DOM mutation. Changes to the predictor may require maintaining both main-thread and worker behavior and snapshot boundaries.
- English localization lives in `lang/en-EN/game.xml`. `lang/fr-FR/game.xml` exists but French is not enabled in `Localization.supportedLang`. Do not silently make translated content or functionality up.
- Never use real player saves as test fixtures, commit exported saves, expose cloud auth tokens, or call a live Google account in tests. Use new browser profiles or explicitly backed-up test saves.

## Work sequence

1. Identify the requirement, affected subsystems, invariant and likely failure path.
2. Make the smallest change with explicit tests. Keep gameplay changes separate from broad refactors and documentation-only PRs.
3. Update the relevant documentation and `docs/reference/action-catalog.md` when action definitions change. Record major decisions as ADRs in `docs/decisions/`.
4. Run `npm run check`, `npm run test:model`, `npm run test:action` and `npm run check:mechanics` (syntax, local file references and documentation integrity). When Python is available, also run `python scripts/check-xml.py`. These are static checks, **not** proof that gameplay works.
5. Exercise relevant scenarios with `docs/development/validation.md`, including at least one save/reload and loop restart for state-affecting changes.
6. Open a PR against `dmchurch`. Include scope, changed mechanics, compatibility, test evidence, and what was **not** tested. Do not merge without explicit authorization.

## Change-specific checks

| Change | Required additional review |
| --- | --- |
| Action, zone or economy | `docs/gameplay.md`, `docs/development/recipes.md`, progression/balance, action catalog |
| Loop/tick/queue | `docs/architecture.md`, `docs/state-and-saving.md`, pause/restart/queue scenarios |
| Save/story/challenges/prestige | `docs/state-and-saving.md`, old-save compatibility, import/export |
| Predictor or snapshots | `docs/predictor.md`, worker parity and background-mode smoke test |
| Views, assets or CSS | `views/AGENTS.md`, `docs/ui-and-localization.md`, responsive and keyboard checks |
| Localization | `lang/AGENTS.md` and XML integrity |
| Editor/schema/data XML | `data/AGENTS.md` and `docs/content-editor.md` |
| Documentation | `docs/AGENTS.md` and `docs/workflow/docs-maintenance.md` |

## Honest verification

This repo begins with no established automated gameplay test suite. Do not describe syntax/URL checks as gameplay tests, claim a browser run without running one, or declare compatibility proven from code inspection. Flag unknowns and high-risk code paths in the PR. Prefer reversible, reviewable changes; do not adjust production deploy configuration or game behavior when the request is documentation-only.
