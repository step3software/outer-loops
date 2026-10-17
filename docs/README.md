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
- [Runtime action mechanics (all 157 actions)](reference/action-mechanics.generated.md)
- [Gameplay zone guides](gameplay/zones/README.md)

## In-depth technical and gameplay review

- [Review methodology and summary](audit/README.md)
- [Technical assessment](audit/technical-review.md)
- [Gameplay assessment](audit/gameplay-review.md)
- [Travel and unlock graph](audit/progression.md)
- [Formula and economy reference](audit/balance-formulas.md)
- [Persistent state and migration schema](audit/persistence-contract.md)
- [Evidence-based findings](audit/findings.md)
- [Coverage and unverified behavior](audit/coverage.md)

## Future Outer Loop / Real World game design (not implemented)

- [Real World / Timeloop Nexus design index and product north star](design/outer-loop/README.md)
- [Agreed decisions, provisional choices and open questions](design/outer-loop/decisions.md)
- [First encounter and narrative bridge](design/outer-loop/narrative.md)
- [New timelines, ~10× replay, upgrades, automation and challenge variants](design/outer-loop/systems.md)
- [**Will / Echoes / Anchors** — proposed three-tree upgrades](design/outer-loop/upgrade-trees.md)
- [**Dominion** — fully documented four-tree alternative](design/outer-loop/dominion-alternative.md)
- [Upgrade mechanics contracts and prospective tests](design/outer-loop/upgrade-tree-contracts.md)
- [Alternate-self characters and later delegation](design/outer-loop/selves.md)
- [Retirement of inherited prestige/challenges and veteran save migration](design/outer-loop/legacy-transition.md)
- [Nexus technical boundaries and persistence design](design/outer-loop/technical-architecture.md)
- [Pixel-art hub brief](design/outer-loop/visual-direction.md)
- [Development roadmap](design/outer-loop/roadmap.md) and [future validation criteria](design/outer-loop/validation.md)
- [Dependencies and RF04 scope conflict](design/outer-loop/integration-with-refactoring.md)

## Approved refactoring planning (implementation not started)

- [RF01–RF06 register, sequencing, dependencies and shared constraints](refactoring/README.md)
- [Cross-milestone acceptance and validation matrix](refactoring/validation-matrix.md)
- [Provisional decisions and design tradeoffs](refactoring/decision-log.md)
- [Six ready-to-use future implementation handoffs](refactoring/handoffs/README.md)

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
