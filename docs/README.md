# Outer Loops engineering handbook

Entry point for developers and coding agents. The code is authoritative; these documents describe the current `main` codebase, derived from the `dmchurch` lineage and must evolve with behavior changes.

## Read first

- [AGENTS.md](../AGENTS.md) — project-wide rules, gates, and review expectations
- [Architecture](architecture.md) — classic-script load sequence, tick engine and state ownership
- [Code map](reference/code-map.md) — where to inspect and change code
- [Orcha adapter](development/ai-workflow.md) — current shared procedure routing, local branch/check rules, legacy authority and host handoff
- [Repository manifest](../.orcha/repository.json) — `main` source, standards from Orcha `main`, local contracts; no automation activation

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

## Refactoring program — RF01–RF03 merged, RF04 planning

- [RF01–RF06 milestone register and current status](refactoring/README.md)
- [RF01 implemented regression coverage and remaining gaps](refactoring/rf01-evidence.md)
- [RF02 persistence-safety charter](refactoring/RF02-persistence-safety.md)
- [RF02 implementation readiness and source-based transaction proposal](refactoring/rf02-readiness.md)
- [RF03 merged source and outstanding verification](refactoring/rf03-evidence.md)
- [RF04 proposed challenge rule isolation plan](refactoring/RF04-challenge-rule-isolation.md)
- [RF02 proposed save, import, quota and recovery tests](refactoring/rf02-test-matrix.md)
- [Cross-milestone validation matrix](refactoring/validation-matrix.md)
- [Decision log and unresolved implementation choices](refactoring/decision-log.md)
- [Implementation handoffs, including RF02](refactoring/handoffs/README.md)

**RF01–RF03 code is merged into `main`.** RF04–RF06 remain unimplemented and require separate plan/preparation and implementation authorization. Documentation or a merged prerequisite never permits a code change, release or merge.

## Future Outer Loop / Real World design (not implemented)

- [Real World / Timeloop Nexus design index](design/outer-loop/README.md)
- [Approved direction and unresolved product decisions](design/outer-loop/decisions.md)
- [Potion arrival, alternate Beginnersville and first self](design/outer-loop/narrative.md)
- [Looping Potion gateway, retained Valley and historical alternatives](design/outer-loop/potion-and-endgame-options.md)
- [First empowered rerun: skill points, temporary boost, ~10× replay and later upgrades](design/outer-loop/systems.md)
- [Will / Echoes / Anchors three-tree working model](design/outer-loop/upgrade-trees.md)
- [Dominion four-tree alternative](design/outer-loop/dominion-alternative.md)
- [Upgrade mechanics and future tests](design/outer-loop/upgrade-tree-contracts.md)
- [Alternate selves and delegation](design/outer-loop/selves.md)
- [Legacy prestige/challenge retirement and veteran saves](design/outer-loop/legacy-transition.md)
- [Nexus technical architecture](design/outer-loop/technical-architecture.md)
- [Pixel-art and UI direction](design/outer-loop/visual-direction.md)
- [RW00–RW08 potion-first development roadmap](design/outer-loop/roadmap.md) · [future validation](design/outer-loop/validation.md)
- [RW00 campaign pacing test implementation plan (draft in PR #10)](design/outer-loop/balance-tests-implementation-plan.md)
- [RW06 Timeline Potions — approved alchemical identity, proposed detailed mechanics](design/outer-loop/RW06.md)
- [RW07 Timeline Wagers — proposed in-game prediction mechanics](design/outer-loop/RW07.md)
- [RW08 Incremental Timeline Bosses (proposed)](design/outer-loop/RW08.md)
- [RF coordination and product scope conflicts](design/outer-loop/integration-with-refactoring.md)

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

## Process and automation authority

Use the [Orcha adapter](development/ai-workflow.md) to select and actually load
current shared instructions before the relevant system guide. Shared standards
come from published Orcha `main`; game scope and compatibility stay in this
repository. The [RF register](refactoring/README.md) retains source delivery
history, while existing Orcha workflow records own orchestration approvals in
legacy mode. Documentation, a manifest and passing checks do not accept stages,
resume scheduling or activate services.

## Source-of-truth policy

Every gameplay assertion should identify code, not folklore. Update documentation in the **same PR** as behavior changes. Record unresolved questions explicitly rather than inventing a rule. Code maps and action catalogs are navigation aids, not generated runtime configuration.
