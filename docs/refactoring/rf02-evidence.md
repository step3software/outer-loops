# RF02 — Persistence safety implementation evidence

**Status:** Implementation candidate in [draft PR #16](https://github.com/step3software/outer-loops/pull/16), unmerged, not verified complete. Reuses previously authored code from [closed, unmerged PR #6](https://github.com/step3software/outer-loops/pull/6) and preserves current RW00 changes on main.

## Accepted scope and source

- RF02-D01: canonical source and draft PR target main; no publication or deployment changes.
- RF02-D02: one previous imported-over save per normal/challenge slot, plus an independent recovery journal.
- RF02-D03: reject incompatible unknown fields without changing existing saves.
- Original external ILSV01 and recognized historical Base64/LZW inputs remain supported. No changed gameplay economy, action IDs, prestige formulas, challenge rules, Google OAuth or player data fixtures.

## Candidate code

- save-import.js contains pure validation of current and legacy saves, nested numeric/boolean/type schemas derived from current gameplay registries, guarded action fields/queues/compressed logs, and bounded expansion of both LZString and legacy Base64/LZW formats.
- saving.js contains pre-import journal, exact-byte backup/restore, verified storage writes, load-time rollback, startup recovery and protected explicit deletion. Normal and challenge backup restoration are selected explicitly; inactive restoration does not switch gameplay, and active restoration reloads after a byte-identical commit.
- index.html, predictor-worker.js and scripts/load-game-model.mjs preserve classic-script order and the current RW00 harness.
- views/menu.view.js and lang/en-EN/game.xml offer separate normal/challenge restore controls.
- New preflight and transaction scripts, updated real-browser smoke, validation workflow and package commands retain the original RF01 and RW00 suites.
- The repository's canonical source instructions now reference main. The Pages deployment workflow remains untouched.

## Tests executed in the implementation session

The actual GitHub-source save-import.js and bundled LZString library were evaluated in an isolated V8 runtime. Seven valid compress/decompress roundtrips, including Unicode and highly compressible strings, matched exactly. An over-limit expansion raised TOO_LARGE, a valid generated ILSV01 payload prepared correctly, and unknown dynamic action fields were rejected when the runtime action allowlist was supplied.

The actual shipping transaction functions were independently evaluated in a synthetic JavaScript environment with exact-string storage. Twenty-one assertions passed for valid import, previous-copy restore, rejection without mutation, journal/active/backup quota faults, apply-time failure, intentional deletion, failed partial deletion and exact rollback. The tool-backed functional exercises were not the repository Node script or the real browser.

A separate source-backed model exercise, using a no-DOM View facade and a stubbed snapshot initialization for the isolated evaluator, executed the unchanged game's loadDefaults/doSave and successfully prepared the generated save with all 157 action varNames recognized. The fresh synthetic save serialized to 13,109 JSON characters / 6,838 encoded characters (139 serialized fields) and returned an identical normalized object. This does not establish the limits for large progressed saves or replace the full Node/Chrome suites. The two RF02 script bodies also completed successfully in isolated V8 with Node API shims; they have not been executed under Node itself.

## Acceptance status

| Gate | Required cases | Current evidence |
| --- | --- | --- |
| A1 | P09–P17, P19, P22 | Partial isolated functional checks; full browser pending |
| A2 | P01–P06, P18, P20 | Test source present; full legacy/browser exercise pending |
| A3 | P02–P04, P07–P08 | Idempotency tests ported; full cross-mode verification pending |
| A4 | P01, P05–P08 | Semantic roundtrips not fully executed |
| A5 | P14–P17, P19, P21 | Partial rollback checks passed; reload/real Chrome pending |
| A6 | Pure preflight + public doSave compatibility | Pure module exercised; full worker check pending |
| A7 | RF01, challenge, prestige, predictor, RW00 | Full regression suite not executed |
| A8 | Size/unknown-field/backup/rollback decisions | Explicit in ADR 001; representative save sizing pending |

Run npm run check, npm run test:model, npm run test:action, both RF01 suites, both RF02 suites, npm run test:balance, npm run check:mechanics, Python XML check and npm run test:browser. No green CI or Chrome acceptance is claimed without evidence.

## Risks and rollback

Real historical player saves were not available; fixtures are synthetic. RF02 uses bounded LZW expansion for imports, while the original helper remains unchanged. Extreme storage quota conditions may leave a journal for boot retry and must never cause deleting site storage. Restoring previously persisted state does not guarantee unsaved activity. The deployment workflow still listens for the historical dmchurch branch; changing it requires separate authorization.

Keep PR #16 draft and unmerged until the A1–A8 evidence and independent review gates are met.

## Review remediation — five findings

- **F01/F03:** Pure validation now checks nested names/fields, actual stat/skill/buff identity, finite numeric/boolean contracts, supported queue identity and action-specific dynamic field families; malformed or incompatible data is rejected before storage writes.
- **F02:** Previous-save restoration validates raw persisted JSON without serializing it again. Journaled restoration writes the exact original byte string.
- **F04:** The Save menu exposes independent normal/challenge restoration. An inactive-slot restore keeps the active save untouched and does not reload the current session.
- **F05:** Legacy Base64/LZW decoding now checks expanded output per phrase and limits compressed code count. The original legacy `decode()` helper remains unchanged outside the RF02 path.

**Focused verification:** The complete RF02 transaction test body and the pure preflight unit-test portion (excluding its Node model-loading section) passed with isolated V8/Node-style shims. Six representative legacy strings matched the original decoder and over-limit output was rejected. A separate source-backed no-DOM simulation successfully validated a progressed save produced by the actual serializer with **157 action definitions, 139 saved fields, and an array-valued action log**; malformed buffs and unsupported nested fields were rejected. A nonempty compressed action log with numeric dictionary-object keys also passed strict validation. Browser smoke was extended for exact-byte recovery after navigation and independent recovery of both slots following intentional clear. **The new Chrome cases and complete Node/CI suite have not been executed in this conversation.**
