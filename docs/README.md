# Outer Loops engineering handbook

Entry point for developers and coding agents. The code is authoritative; these documents describe the checked-in `dmchurch` lineage as of the documentation baseline and must evolve with behavior changes.

## Read first

- [AGENTS.md](../AGENTS.md) — project-wide rules, gates, and review expectations
- [Architecture](architecture.md) — classic-script load sequence, tick engine and state ownership
- [Code map](reference/code-map.md) — where to inspect and change code
- [AI development workflow](development/ai-workflow.md) — branch, implementation, validation and PR protocol

## System guides

- [Gameplay, actions, zones and progression](gameplay.md)
- [State, loop boundaries and save compatibility](state-and-saving.md)
- [Predictor, worker and snapshots](predictor.md)
- [UI, events, themes and localization](ui-and-localization.md)
- [Standalone XML content editor](content-editor.md)
- [Action catalog](reference/action-catalog.md)

## Development guides

- [Local setup](development/setup.md)
- [Validation and regression matrix](development/validation.md)
- [Change recipes](development/recipes.md)
- [Debugging guide](development/troubleshooting.md)
- [AI change lifecycle](development/ai-workflow.md)

## Source and governance

- [Repository code map](reference/code-map.md)
- [Glossary](reference/glossary.md)
- [Upstream lineage and rights caveat](reference/upstream-and-rights.md)
- [Known gaps and risk register](reference/known-gaps.md)
- [Architecture decisions](decisions/README.md) and [ADR template](decisions/TEMPLATE.md)
- [Feature / bug-fix thread prompt](workflow/feature-or-bug-fix.md)
- [Documentation maintenance prompt](workflow/docs-maintenance.md)
- [PR review prompt](workflow/pr-review.md)

## Source-of-truth policy

Every gameplay assertion should identify code, not folklore. Update documentation in the **same PR** as behavior changes. Record unresolved questions explicitly rather than inventing a rule. Code maps and action catalogs are navigation aids, not generated runtime configuration.
