# Local supplement: PR review and merge readiness

Load the current Orcha [review procedure](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/agent-workflows/review.md)
through the [adapter](../development/ai-workflow.md#read-for-the-requested-action),
then root/nested instructions and the relevant project guides. Establish the
PR's actual base/head repositories, refs and revisions; the ordinary publication
target is `dmchurch`, but a stacked PR may have another actual comparison base.

## Game-specific review focus

Trace affected behavior for classic-script order, localized XML keys/assets,
action `name`/`varName` compatibility, resources/progression, loop/queue semantics,
save/load and recovery, challenge/prestige interactions, worker/snapshot parity,
editor/runtime separation, cloud credentials and rights constraints. Use the
[validation guide](../development/validation.md) and implicated assertions rather
than equating static checks with gameplay proof.

Map applicable current Orcha and project requirements to inspected paths and
verification evidence. Report concrete findings, unverified checks and coverage
limits, including skipped browser cases and save assumptions. Keep source,
historical tests, current CI, installed behavior and owner acceptance distinct.

Review is **read-only**. A request to review or assess readiness does not permit
repairs, source/status edits, accepting a milestone, merging or deployment.
An explicit request to prepare an existing PR for merge uses shared
[PR readiness](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/agent-workflows/pr-readiness.md) and its required
review/fix procedures; fixes still require authorized scope and existing writer
protection on that PR's head branch. Never push repairs to `dmchurch` or treat a
clean review as merge permission.
