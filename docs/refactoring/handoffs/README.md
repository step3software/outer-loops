# Refactoring milestone implementation handoffs

These prompts are retained implementation handoffs, not permission to restart completed work. RF01, RF02 and RF03 have merged implementations. RF04 already has an unmerged candidate in PR #21. Consult the [program register](../README.md) and each milestone's current evidence before selecting remaining work; correction #24 is merged and the #23 cleanup correction passes all 20 selected checks. RF04 remains unmerged; milestone acceptance remains separate. RF05–RF06 remain planned and need separate implementation authorization.

## How to use

After the prior milestone's acceptance gate is satisfied, provide the intended agent with the relevant handoff file and tell it to implement **that** milestone only. Each handoff links to the canonical charter, scope boundaries, critical source, tests and expected PR deliverables.

| Milestone | Implementation prompt | Readiness prerequisite |
| --- | --- | --- |
| RF01 | [Regression coverage — executed/merged](RF01.md) | **Completed in PR #4** |
| RF02 | [Persistence safety — merged, correction and rerun verified](RF02.md) | [RF02 current verification](../rf02-evidence.md); do not duplicate PR #16 |
| RF03 | [Gameplay rules/resources — merged](RF03.md) | [RF03 current verification](../rf03-evidence.md); preparation #17 remains open |
| RF04 | [Challenge isolation — candidate in PR #21](RF04.md) | [RF04 current verification](../rf04-evidence.md); preserve the existing stack |
| RF05 | [Action modules](RF05.md) | RF01 ordered registry tests; recommend RF02–RF04 landed |
| RF06 | [View layer](RF06.md) | RF03 rule boundary and RF05 stable entry-point script order |

Every implementation PR should use the canonical source `main` as base, reference the milestone identifier, include before/after test evidence and state unverified cases. Do **not** merge without explicit authorization. See [program register](../README.md) and [validation matrix](../validation-matrix.md).
