# Refactoring plan and handoff instructions

Inherits [repository AGENTS.md](../../AGENTS.md) and [documentation AGENTS.md](../AGENTS.md).

- The RF01–RF06 charters are **approved planning scopes only**. **RF01 was separately authorized and merged in PR #4**; **RF02 PR #16 and RF03 PR #18 are merged; RF04 has an unmerged candidate in draft PR #21**. Consult the [register](README.md) and current evidence before new work; merged delivery does not establish complete verification or an Orcha stage receipt. Readiness documents do not authorize merging, deployment, changes beyond RF02 or marking unexecuted tests passed.
- Keep one canonical milestone specification in each `RFxx-*.md`. `handoffs/RFxx.md` contains a concise, self-contained execution prompt referencing it; don't copy whole technical specifications into prompts.
- Use the technical/gameplay [audit](../audit/README.md), [findings](../audit/findings.md), [coverage](../audit/coverage.md), [code map](../reference/code-map.md) and verified source to ground changes.
- Declare scope, excluded changes, hard versus recommended dependencies, source touchpoints, compatibility invariants, observable acceptance criteria, fixture/test coverage, risks, rollback, and a link to the next implementation handoff.
- Mark **planned future tests** separately from **tests actually run** in any PR summary or status update.
- Treat any potentially breaking design choice as a proposal pending milestone implementation, not as a newly adopted architectural decision. Use the [ADR template](../decisions/TEMPLATE.md) if the later implementation chooses a durable contract.
- Maintain navigation links in [this register](README.md) and [the handbook](../README.md). Do not silently reorder RF01–RF06 or mark milestones complete.
