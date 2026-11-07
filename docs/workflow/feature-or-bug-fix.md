# Local supplement: feature or bug fix

Use the [Orcha adapter](../development/ai-workflow.md#read-for-the-requested-action)
to load the current shared **fix** or **feature** procedure, then the
[root instructions](../../AGENTS.md) and relevant system guide. A milestone task
instead requires its accepted preparation and separate implementation grant.

Provide the requested player-visible result, reproducible current behavior,
testable acceptance conditions and explicit scope exclusions. Inspect the owning
source through the [code map](../reference/code-map.md) before editing. Preserve
action identities, saves, zero-based zones, loop/challenge/prestige boundaries,
localization and predictor behavior unless the authorized scope changes them.

Apply local [branch and publication rules](../development/ai-workflow.md#source-branches-and-publication).
Use existing mechanisms, keep the patch focused, update affected system docs and
the action catalog when applicable, and run the [required checks](../development/validation.md).
Use disposable profiles/synthetic saves for relevant browser scenarios. Explain
the concrete behavior change, compatibility, actual evidence and unverified cases
in a draft PR against `dmchurch`; do not merge.

A documentation handoff, roadmap or review finding does not grant repair scope.
Reuse accepted decisions and preparations; escalate only missing consequential
choices without inventing game mechanics or revising accepted criteria.
