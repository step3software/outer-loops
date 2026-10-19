# Refactoring plan and handoff instructions

Inherits [repository AGENTS.md](../../AGENTS.md) and [documentation AGENTS.md](../AGENTS.md).

- The RF01–RF06 charters are **approved planning scopes only**. **RF01 was separately authorized and merged in PR #4**; **RF02 is prepared for a separate implementation request but has no gameplay/persistence implementation yet**. Existing handoff prompts or readiness docs never authorize modifying runtime files, opening a code implementation PR, or merging.
- Keep one canonical milestone specification in each `RFxx-*.md`. `handoffs/RFxx.md` contains a concise, self-contained execution prompt referencing it; don't copy whole technical specifications into prompts.
- Use the technical/gameplay [audit](../audit/README.md), [findings](../audit/findings.md), [coverage](../audit/coverage.md), [code map](../reference/code-map.md) and verified source to ground changes.
- Declare scope, excluded changes, hard versus recommended dependencies, source touchpoints, compatibility invariants, observable acceptance criteria, fixture/test coverage, risks, rollback, and a link to the next implementation handoff.
- Mark **planned future tests** separately from **tests actually run** in any PR summary or status update.
- Treat any potentially breaking design choice as a proposal pending milestone implementation, not as a newly adopted architectural decision. Use the [ADR template](../decisions/TEMPLATE.md) if the later implementation chooses a durable contract.
- Maintain navigation links in [this register](README.md) and [the handbook](../README.md). Do not silently reorder RF01–RF06 or mark milestones complete.
