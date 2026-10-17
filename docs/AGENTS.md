# Documentation agent instructions

Inherits [repository AGENTS.md](../AGENTS.md).

- Verify behavior in current executable source before writing documentation; use relative Markdown links for internal references.
- Distinguish **observed**, **planned**, **proposed**, and **unverified** behavior. Do not invent tests, licenses, deployment statuses, game mechanics or save guarantees.
- When code changes, update the affected system guide, code map, action catalog (when appropriate), smoke checklist, and ADR if a significant architectural decision was made.
- Prefer one canonical explanation per system with cross-links over copying paragraphs to multiple files.
- Check commands against `package.json` and actual file names; the live game is governed by `actionList.js`, not `data/actionList.xml`.
- Run `npm run check` before submitting documentation. Avoid hard-coded line numbers because upstream files are frequently edited.
