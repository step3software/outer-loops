# Refactoring milestone implementation handoffs

These prompts are **implementation handoffs**, not blanket permission to edit source or merge. **RF01's handoff has already been executed and its PR merged**. **RF02 is now prepared for a separately authorized implementation**, with its [readiness brief](../rf02-readiness.md) and [test matrix](../rf02-test-matrix.md). Each future milestone requires its own explicit implementation request.

## How to use

After the prior milestone's acceptance gate is satisfied, provide the intended agent with the relevant handoff file and tell it to implement **that** milestone only. Each handoff links to the canonical charter, scope boundaries, critical source, tests and expected PR deliverables.

| Milestone | Implementation prompt | Readiness prerequisite |
| --- | --- | --- |
| RF01 | [Regression coverage — executed/merged](RF01.md) | **Completed in PR #4** |
| RF02 | [Persistence safety — prepared](RF02.md) | **RF01 F08/F09 merged**; [readiness](../rf02-readiness.md) and [P01–P22 test plan](../rf02-test-matrix.md); implementation not authorized |
| RF03 | [Gameplay rules/resources](RF03.md) | RF01 parity and RF02 storage contracts |
| RF04 | [Challenge isolation](RF04.md) | RF01 challenge fixtures, RF02 save slots, RF03 rule boundary |
| RF05 | [Action modules](RF05.md) | RF01 ordered registry tests; recommend RF02–RF04 landed |
| RF06 | [View layer](RF06.md) | RF03 rule boundary and RF05 stable entry-point script order |

Every implementation PR should use the current default `dmchurch` as base, reference the milestone identifier, include before/after test evidence and state unverified cases. Do **not** merge without explicit authorization. See [program register](../README.md) and [validation matrix](../validation-matrix.md).
