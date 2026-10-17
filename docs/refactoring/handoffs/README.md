# Refactoring milestone implementation handoffs

These prompts are **prepared for future implementation threads only**. Writing them does **not** authorize an AI agent to implement a milestone, touch gameplay files, or merge. A new explicit request is required for each milestone.

## How to use

After the prior milestone's acceptance gate is satisfied, provide the intended agent with the relevant handoff file and tell it to implement **that** milestone only. Each handoff links to the canonical charter, scope boundaries, critical source, tests and expected PR deliverables.

| Milestone | Implementation prompt | Readiness prerequisite |
| --- | --- | --- |
| RF01 | [Regression coverage](RF01.md) | Current docs/test baseline available |
| RF02 | [Persistence safety](RF02.md) | RF01 F08/F09 characterization and save fixtures |
| RF03 | [Gameplay rules/resources](RF03.md) | RF01 parity and RF02 storage contracts |
| RF04 | [Challenge isolation](RF04.md) | RF01 challenge fixtures, RF02 save slots, RF03 rule boundary |
| RF05 | [Action modules](RF05.md) | RF01 ordered registry tests; recommend RF02–RF04 landed |
| RF06 | [View layer](RF06.md) | RF03 rule boundary and RF05 stable entry-point script order |

Every implementation PR should use the current default `dmchurch` as base, reference the milestone identifier, include before/after test evidence and state unverified cases. Do **not** merge without explicit authorization. See [program register](../README.md) and [validation matrix](../validation-matrix.md).
