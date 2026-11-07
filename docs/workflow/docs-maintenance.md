# Local supplement: documentation maintenance

Load current Orcha [documentation consolidation](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/agent-workflows/documentation-consolidation.md)
through the [adapter](../development/ai-workflow.md), then [root instructions](../../AGENTS.md)
and [documentation rules](../AGENTS.md). Apply the requested documentation
improvements on one protected docs branch and deliver one draft PR against
`dmchurch`; do not merge. A request for findings only remains read-only.

## Local scope and proof

Ground statements in executable source, exact commit metadata or observed tests.
`actionList.js` owns executable actions; `data/actionList.xml` belongs to the
experimental editor; `lang/en-EN/game.xml` owns English localization. Preserve
accepted mechanics, canonical milestone files/IDs, decisions, dependencies and
prior evidence. Keep proposed designs and future tests visibly separate from
implemented behavior and observed verification.

Use [the handbook](../README.md) to select the affected contract instead of
rereading all history. Repair canonical owners and precise links; avoid another
shared workflow, progress ledger or broad status checklist. Report substantive,
selective and unreviewed coverage honestly. Inspect relevant outstanding PRs and
their real bases before recovering missing documentation.

Run `npm run check` and XML validation when Python is available. For manifest or
instruction-chain changes, also use [Orcha validation](../development/ai-workflow.md#local-implementation-and-verification)
and retain the observed standards revision/document hashes. Do not change game
code, deployment workflows, host policy, lifecycle approvals or service state as
incidental documentation cleanup. A passing check does not establish live host
adoption, save compatibility or gameplay correctness.
