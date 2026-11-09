# RF02 — Persistence safety verification

**Status:** Merged in [PR #16](https://github.com/step3software/outer-loops/pull/16); verification incomplete, not milestone acceptance or deployment evidence.
**Verified source:** `main` `1815ad7b52e9b976e92f11b845309bd9e0d80724`, which includes merged RF02 and RF03.
**Current evidence:** [run record](../../.orcha/evidence/2026-11-09-rf02-rf04-verification.json).

## Current results

- **Passed:** source-backed RF02 preflight and transaction fault-injection Node scripts; RF01 model/challenge characterization; RF03 model; base game/action and balance-contract checks; campaign-estimate assertions; XML parsing.
- **Passed in the adapted real-browser run:** legacy Base64/LZW import; malformed JSON/compression/shape rejection with both slots and existing recovery copies unchanged; byte-exact normal restoration and backup rotation; journal/active-write quota rejection; legacy inline challenge migration; normal/challenge entry and exit for modes 1–3; inherited prestige reset; foreground/real Worker Wander parity.
- **Failed:** P19/P21 independent challenge restoration after explicit clear. After the existing challenge and prestige scenarios, both slots are cleared into their backups; `restorePreviousImport(challengeSaveName)` returns `false` instead of `true`. Reproduced at `scripts/test-browser-smoke.mjs:628` on main and `:729` on the RF04 candidate. Backup-byte assertions before restoration pass. The final normal-restoration assertions are not reached. The browser reports `options.updateRate has an unsupported type.` Source tracing and an isolated source-backed reproduction confirm live schema drift: `getImportContract()` derives `optionTypes` from current mutable option values, while `doLoad` can restore `updateRate` directly from string-valued localStorage. A backup with numeric `options.updateRate` is then rejected against the current string contract. The same numeric-save/string-contract case throws `INVALID_OPTION` in Node. Use stable canonical option types or explicit legacy normalization, retain byte-exact backup data, and regress both directions of numeric/string option changes before claiming recovery complete. No runtime repair is included here.

## A1–A8 verification mapping

| Criteria | Evidence and disposition |
| --- | --- |
| A1/A2/A3 | Pure preflight, malformed-input and transaction tests pass; browser rejection, legacy import and migration cases pass. Authentic historical-save compatibility is not established. |
| A4 | Current/legacy fixture and model roundtrips pass; complete cross-mode acceptance remains incomplete because the final recovery scenario fails. |
| A5 | Normal exact-byte recovery and synthetic interrupted/quota/apply rollback pass; independent challenge recovery after clear fails in Chrome. **Unresolved.** |
| A6 | Pure module and shipping transaction functions exercised; browser integrations observed. |
| A7 | Focused RF01/RF02/RF03 and selected real Worker/browser cases pass; full browser and balance suites fail or remain incomplete. **Unresolved.** |
| A8 | [ADR 001](../decisions/ADR-001-recoverable-save-import.md) and the [P01–P22 matrix](rf02-test-matrix.md) retain the bounded decode, unknown-field and recovery policy. Tests do not certify every historical save shape. |

## Verification conditions — November 9, 2026

Windows, Node.js 24.22.1 and Python 3.12.14; fresh isolated worktrees and synthetic fixtures only. The recorded checks ran the repository script entry points directly, equivalent to the package commands, with a 240-second host ceiling per entry point. No player saves or cloud accounts were used.

The unmodified browser command cannot discover Windows Chrome: its POSIX `--version` probe times out. An external test-environment adapter selected the installed Chrome executable and dismissed expected `alert` dialogs in the disposable profile. It changed no game code, test assertion, confirmation decision or save fixture. Results below explicitly refer to that adapted browser run; ordinary CI/browser invocation is still a portability gap.

## Shared regression blockers

- `generate-balance-timing-report.mjs --check` fails: the generated report's source identity is stale. The captured regeneration retains the numerical estimates.
- `generate-action-mechanics.mjs --check` fails: generated source references are stale (including shifted action line anchors). No gameplay correction is inferred.
- `test-balance-equivalence.mjs` exceeds the 240-second host ceiling after partial equivalence passes; incomplete is not a pass.
- `test-balance-supervisor.mjs` returns `budget_exceeded` where the test expects `complete`; `test-balance-potion.mjs` also encounters its runtime budget before the expected validation error. Host-load effects were not isolated, so these are failed verification gates, not established gameplay defects.
- The complete adapted browser suite fails when restoring the challenge backup after explicit clear. The restore returns `false`; remaining post-failure browser assertions did not execute.

Full campaign, authentic historical saves, broad predictor parity and live deployment remain unverified. The pre-existing R15 Gods Trial discrepancy remains outside this task.

## Historical provenance and authority

The prior [implementation-session ledger](https://github.com/step3software/outer-loops/blob/1815ad7b52e9b976e92f11b845309bd9e0d80724/docs/refactoring/rf02-evidence.md) preserves the isolated V8 roundtrips, transaction assertions, review remediations and their original limitations. November 9 Node/Chrome observations above supersede its unexecuted-check and unmerged labels; they do not rewrite those historical results.

RF02-D01/D02/D03, the original ILSV01 envelope, normal/challenge slot names and immutable owner history are retained. Orcha's live approval stage is still `proposed`, with no accepted plan/preparation artifacts; observed merges and this verification do not fabricate them. Do not restart the merged implementation or clear recovery data. A follow-up fix needs its own authorized scope.
