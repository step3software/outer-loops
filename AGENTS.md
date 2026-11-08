# Agent operating instructions

These instructions apply to the entire repository. Read [.orcha/repository.json](.orcha/repository.json), [the documentation index](docs/README.md), and the relevant system guide; nested `AGENTS.md` files add directory-specific requirements. The [local Orcha adapter](docs/development/ai-workflow.md) owns project-specific delivery and automation handoff details.

## Project identity

Outer Loops is an independently maintained fork of Idle Loops: `step3software/outer-loops`, forked from `dmchurch/omsi-loops`, ultimately descended from `omsi6/omsi6.github.io`. It is a browser-based incremental/time-loop game, not a Node server or bundled SPA. The current default branch is `main`. Upstream code has no GitHub-recognized license; do not assume commercial reuse rights or add a license without the rights holder's authorization. See `docs/reference/upstream-and-rights.md`.

## Shared process and authority

Use current published Orcha `main`: read [Orcha AGENTS.md](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/AGENTS.md),
[intent routing](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/agent-workflows/intent-routing.md), and the selected
shared procedure. Resolve the [registry](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/config/repositories.json) and
[standards catalog](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/standards/catalog.json) from the same observed revision.
Use `standards_resolver` to verify applicable document hashes; record the revision,
paths and hashes for the run. Links alone do not load instructions. Offline workers
receive the host's captured text. Do not pin shared versions or require module adoption.

The manifest preserves `main` as canonical source and `legacy` milestone
authority. Existing Orcha workflow records retain stage/approval authority; the
[RF register](docs/refactoring/README.md) retains source delivery history and links
to canonical specifications. Do not create a competing status ledger or treat
documented readiness, a PR, or a status edit as owner acceptance. Repository-mode
cutover, scheduling changes, service activation, merging and deployment retain
their separate authorization gates.

Questions, investigations and reviews are read-only. Only an explicit authorized
write scope permits edits. Use the [shared development reading path](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/development-workflow.md#development-process-reading-path)
for stages, writer protection and publication; retain all local game invariants below.

## Mandatory orientation

1. Read `docs/audit/findings.md` for known hazards; read `README.md` for local launch and `docs/architecture.md` for script ordering and runtime ownership.
2. Locate the smallest source-of-truth surface using `docs/reference/code-map.md`. Search the actual code rather than guessing from UI names.
3. Read the applicable `docs/development/recipes.md`, `docs/state-and-saving.md`, and `docs/development/validation.md` before changing state, actions, saves, or UI.
4. Inspect `git status`, current source revision and open PRs. Use a dedicated branch/worktree under `C:\Users\PhillipCurry\projects\codex` and verify existing fenced writer protection before edits. Never silently replace or rebase others' work; preserve uncertain ownership and publication outcomes.
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

## Future Outer Loop design scope

The [Real World / timeloop nexus design](docs/design/outer-loop/README.md) is approved **product direction**, not existing game behavior or an implementation authorization. **Drinking the Looping Potion**, not finishing `RestoreTime`, is the intended entry into a separate, altered **Beginnersville** with several alternate selves and a first guide-self conversation. **Valley of Olympus remains a separate, later-to-be-shortened original-game capstone.** First rerun grants initial skill points and a **substantial temporary boost** separately from free permanent **~10× replay speed**; their exact mechanics remain open. Reveal deeper upgrades, keys/wagers and eventual parties later; no full metagame tutorial on arrival. A single Real World nexus will replace separate prestige/challenge UX when implemented. Do **not** remove `prestige.js`, change current `RestoreTime`/Totem gameplay or old saves, renumber towns, add a tenth ordinary `Town`, or guess potion access/currency/boost/migration terms before separate scoped implementation authorization. Read [outer-loop decisions](docs/design/outer-loop/decisions.md), [potion source](docs/design/outer-loop/potion-and-endgame-options.md), [technical boundary](docs/design/outer-loop/technical-architecture.md) and [legacy risks](docs/design/outer-loop/legacy-transition.md).

## Refactoring scope guard

The approved [RF01–RF06 planning register](docs/refactoring/README.md) is not permission to implement or merge any refactor. Use the matching milestone, readiness gates, cross-mode test matrix and future implementation handoff only when the user explicitly authorizes that milestone.

## Work sequence

1. Identify the requirement, affected subsystems, invariant and likely failure path.
2. Make the smallest change with explicit tests. Keep gameplay changes separate from broad refactors and documentation-only PRs.
3. Update the relevant documentation and `docs/reference/action-catalog.md` when action definitions change. Record major decisions as ADRs in `docs/decisions/`.
4. For documentation-only changes, run `npm run check`, XML validation when Python is available, and focused manifest/standards validation when `.orcha/` changes. For code changes, run the automated baseline and affected cases in [validation](docs/development/validation.md), including RF01 characterization checks. These are **not** a complete gameplay, save-migration or predictor-parity suite.
5. Exercise relevant scenarios with `docs/development/validation.md`, including at least one save/reload and loop restart for state-affecting changes.
6. Publish through the authorized host path as a draft PR against `main`. Include scope, changed mechanics if any, compatibility, exact revision, test evidence, and what was **not** tested. Verify the remote result before releasing owned writer protection. Do not merge without explicit authorization.

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

RF01 added synthetic model, challenge and isolated-browser regression coverage; see the [evidence ledger](docs/refactoring/rf01-evidence.md). Authentic historical-save compatibility, full progression and broad predictor parity remain unverified. Do not describe syntax/URL checks as gameplay tests, claim a browser run without running one, or declare compatibility proven from code inspection. Flag unknowns and high-risk code paths in the PR. Prefer reversible, reviewable changes; do not adjust production deploy configuration or game behavior when the request is documentation-only.
