# RF03 — Gameplay rules and resource verification

**Status:** Merged in [PR #18](https://github.com/step3software/outer-loops/pull/18); focused behavior verified, broader milestone verification incomplete.
**Verified source:** `main` `1815ad7b52e9b976e92f11b845309bd9e0d80724`. RF02 PR #16 is merged; preparation PR #17 remains independently open.
**Run record:** [November 9 evidence](../../.orcha/evidence/2026-11-09-rf02-rf04-verification.json).

## A1–A8 verification mapping

| Criteria | Observed evidence | Result |
| --- | --- | --- |
| A1/A5/A6 | Node DOM-less cap/default/snapshot tests; real Chrome edits Ritual to 17 and Imbuement to 5, rejects blank input, saves/reloads, and exercises production `predictor-worker.js` snapshots and cap-gated forecasts | Focused cases passed |
| A2/A3 | Repeated Escape queries and 422 registered predicate checks; first positive spend, zero spend, aborted/paused scheduling, sticky continuation/reset; real foreground/Worker prediction below/at 60 seconds | Focused cases passed |
| A4 | All 18 numeric/nine boolean resource classes, fractional/negative values, NaN/Infinity/wrong type/unknown key/overflow rejection before mutation, DOM-less calls and stable reset identity | Node cases passed |
| A7 | RF01 model/challenge and RF02 preflight/transaction pass; real Wander prediction, challenge-slot transitions and prestige cases pass. Entire browser run later fails RF02 challenge recovery; balance and generated-reference checks fail or time out | Incomplete |
| A8 | Ownership traced through `stats.js`, `saving.js`, `driver.js`, `actions.js`, `actionList.js`, views and `predictor.js`; source-backed assertions inspected | Covered for selected behavior, no exhaustive compliance claim |

## Shared environment and remaining gates

The [RF02 verification conditions](rf02-evidence.md#verification-conditions--november-9-2026) describe the exact Windows/Node/browser adapter, and its [shared regression blockers](rf02-evidence.md#shared-regression-blockers) record the generated-reference, host-budget and recovery failures on both revisions. These remain acceptance gaps here; focused passes are not a passing complete suite.

## Historical provenance and authority

The [prior implementation ledger](https://github.com/step3software/outer-loops/blob/1815ad7b52e9b976e92f11b845309bd9e0d80724/docs/refactoring/rf03-evidence.md) preserves the isolated V8 checks, follow-up test authorship and original pending gates. The current execution replaces its unmerged and never-executed labels; it does not claim green CI or complete campaign/save parity.

RF03-D05 A and RF03-D06 A, A1–A8, save identities, challenge rules and RF02 backups remain unchanged. Orcha's live approval stage remains `proposed` with no accepted host artifacts. No new implementation, acceptance, merge or deployment is authorized by this record.
