# Orcha development and automation adapter

The [root instructions](../../AGENTS.md) and [repository manifest](../../.orcha/repository.json)
are the entry points. This document owns Outer Loops' local application of the
shared process. It does not define another lifecycle or status ledger.

## Read for the requested action

Resolve current published Orcha `main` once for each new context, then read its
[AGENTS.md](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/AGENTS.md), [intent routing](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/agent-workflows/intent-routing.md),
and selected procedure. The [development process reading path](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/development-workflow.md#development-process-reading-path)
owns common stages, approvals, commit/PR structure and completion evidence.

| Requested work | Shared procedure | Local supplement |
| --- | --- | --- |
| Question or investigation | [Investigate](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/agent-workflows/investigate.md) | [Code map](../reference/code-map.md), affected system guide and source; read-only |
| Review | [Review](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/agent-workflows/review.md) | [Review focus](../workflow/pr-review.md); actual PR base/head; read-only |
| Bounded bug fix or small feature | [Fix](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/agent-workflows/fix.md) or [feature](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/agent-workflows/feature.md) | [Game constraints](../workflow/feature-or-bug-fix.md), affected invariants and checks |
| Milestone plan | [Plan](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/agent-workflows/plan.md) | Existing canonical specification, decisions, prior evidence and dependencies |
| Milestone preparation | [Prepare](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/agent-workflows/prepare.md) | Exact accepted plan and existing file-level handoff; no production source edits |
| Milestone implementation | [Implement](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/agent-workflows/implement.md) | Exact approved preparation/files and implementation grant, then relevant source/checks |
| Documentation update | [Documentation consolidation](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/agent-workflows/documentation-consolidation.md) | [Documentation rules](../AGENTS.md) and [maintenance scope](../workflow/docs-maintenance.md) |

Actually load each applicable shared document; a URL is a locator. Use
`standards_resolver` against the observed main catalog and retain the exact
revision, document paths, Git blob IDs and SHA-256 hashes as run evidence. The
host supplies captured instruction text to offline workers; it must not substitute
`dev`, an old local checkout or a historical evidence snapshot when main cannot
be verified. Proposed catalog modules are not current rules. The checked-in
[standards observation](../../.orcha/evidence/2026-11-06-standards.json) records this
documentation update only, and is not a version pin for later work.

## Source, branches and publication

- Repository identity is `step3software/outer-loops` (GitHub ID `779319581`);
  canonical source and PR target are `dmchurch`. Refresh its exact revision and
  inspect open PRs before starting; do not substitute Orcha's `dev` branch.
- Use `feature/<topic>`, `fix/<topic>` or `docs/<topic>` in an isolated worktree
  under `C:\Users\PhillipCurry\projects\codex`. Confirm existing fenced writer
  protection for that branch/checkout before edits and through verified publication.
  The [control definitions](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/pr-development-coordination.md#branch-ownership-review-holds-and-integration-intent)
  distinguish branch ownership, review holds and integration intent. Sharing the
  eventual `dmchurch` target does not reserve that target throughout development.
- Use only installed, verified coordination/publication support. Preserve active
  or uncertain claims; do not enable a default-off coordinator or queue to start
  this project. Record dependency order and exact parent revision for stacked work.
- Automated model workers follow [Codex execution](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/codex-execution.md):
  planning/preparation read source without production edits, implementation stays
  within approved paths, and only the trusted host publishes verified work.
  Do not expose host credentials or put raw agent traces/player saves in Git.
- Deliver a focused draft PR against `dmchurch`, with exact source/candidate
  revisions, scope, checks, compatibility risks and unverified cases. Reconcile
  unknown remote outcomes before retrying. Keep the PR open for human review.
  No completion report grants merge, release or deployment permission.

The existing [Pages workflow](../../.github/workflows/static.yml) deploys on
pushes to `dmchurch` and manual dispatch. A merge to this branch can therefore
publish the game; do not merge or manually trigger deployment as documentation
cleanup. Orcha's own local-dev delivery exception does not apply to Outer Loops.

## Milestone authority and reuse

The manifest declares **legacy** authority. Existing Orcha
`workflow/records.json` owns orchestration stage acceptance and implementation
grants. The [RF register](../refactoring/README.md) owns source delivery history
and links to the existing `RFxx-*.md` specifications. Its historical vocabulary
does not prove an Orcha stage receipt. Preserve RF01's merged completion and
reuse RF02's [readiness brief](../refactoring/rf02-readiness.md),
[test matrix](../refactoring/rf02-test-matrix.md) and
[handoff](../refactoring/handoffs/RF02.md); do not restart completed work or
discard those preparation candidates because accepted host artifacts are absent.

`milestones.root: docs/refactoring` locates the existing RF material. It does not
claim that typed state companions exist, enroll another roadmap or migrate
authority. Preserve current specification paths and established criterion IDs.
New milestone specifications contain one stable ID per file with independently
testable scope, dependencies and verification, following the local layout and
[milestone format](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/milestone-file-conventions.md). A future
[repository milestone migration](https://github.com/Wisteria-Psychological-Services/project-management-orchestration/blob/main/docs/repository-milestones.md) requires
comparison, preserved approvals/artifact bytes and the existing owner cutover
path. Do not generate accepted state or placeholder approval receipts here.

The [Real World roadmap](../design/outer-loop/roadmap.md) remains proposed
sequencing. Its [decision log](../design/outer-loop/decisions.md) owns approved
direction and unresolved choices. The [RF integration guide](../design/outer-loop/integration-with-refactoring.md)
owns scope tensions such as RF04. This adapter accepts no new game mechanics,
currencies, migration terms or milestone implementation scope.

## Host handoff and remaining gates

This repository provides the source identity, current-main standards reference,
local contracts and publication/check instructions. These become canonical when
the documentation PR is reviewed and merged; a passing manifest check alone does
not prove that a host has refreshed them or that automation can execute work.

Read current priority, pauses/focus, stage approvals and runtime journals from
the existing host before selecting work. Its `config/priorities.json` and
`workflow/records.json` remain authoritative; do not copy their mutable values
into this repository as another status ledger. Source preparation documents are
candidates to reuse, not proof of accepted host artifacts. This documentation
update changes no host policy or lifecycle approval.

For the next authorized stage, the trusted host must refresh canonical `dmchurch`
after publication, reconcile the selected milestone against existing source and
legacy evidence, reuse existing artifacts and collect only missing stage decisions.
An owner priority/resume decision is required before new starts while the project
is Off; it does not itself accept a plan or authorize implementation. Current
quota/model/source checks, writer claims and any service/maintenance activation
gates still apply. Never start workers, accept stages or activate services merely
because this repository has a manifest.

## Local implementation and verification

Preserve classic-script order, stable actions/zone indices, save and reset
boundaries, localization, and foreground/worker predictor behavior. Use the
[code map](../reference/code-map.md) to locate the owning source, then the
affected system guide and [recipes](recipes.md). Update those owners with code
changes; use an [ADR](../decisions/README.md) for a significant durable decision.

For documentation-only work, run `npm run check`, `python scripts/check-xml.py`
when Python is available, and the focused manifest/standards checks below when
the manifest or instruction chain changes. Code changes use the full
[automated baseline and affected scenarios](validation.md). All state-affecting
changes need save/reload and loop-restart coverage with synthetic data or a
disposable profile. Report only checks actually performed.

From a verified Orcha source checkout, the existing portable check is:

```powershell
python -B standards_check.py --repository <outer-loops-worktree> --orcha <verified-orcha-checkout>
```

This validates the manifest, applicable current-main hashes, local contract
paths and any existing typed records. Zero typed records is expected in this
legacy integration; the check explicitly does not infer workflow approval or
domain compliance. Validate task-specific nested instructions through
`standards_resolver.resolve(..., task=..., paths=[...])` for affected paths.
The command neither enables scheduling nor starts a service.
