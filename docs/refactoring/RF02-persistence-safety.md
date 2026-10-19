# RF02 — Persistence safety

- **Status:** **Ready for explicit implementation authorization**, on the merged RF01 foundation. Documentation and safety test planning only; **no RF02 code has been implemented**.
- **Priority:** After RF01
- **Hard dependencies:** RF01's current/legacy synthetic save, corrupt-import, challenge-slot and restart fixtures
- **Enables:** Safe resource/state contracts in RF03 and challenge save transitions in RF04
- **Primary implementation handoff:** [RF02](handoffs/RF02.md)
- **Verified preparation:** [source-anchored readiness and proposed transaction approach](rf02-readiness.md) · [P01–P22 prospective test matrix](rf02-test-matrix.md). These supplement—not replace—A1–A8.

## Objective

Make importing, migrating and writing game progress **validation-first, recoverable and testable** while retaining the established save/export contract. Currently `saving.js` `processSave` may call `storeSaveJson` **before** `load` parses an imported JSON payload (audit [R01](../audit/findings.md)). RF02 must remove that irreversible ordering risk without rewriting game rules or making existing saves unusable.

## Prepared after RF01 merge

The [merged RF01 regression suite](rf01-evidence.md) confirms the defective R01 write-before-validate ordering in a disposable browser, validates two reconstructed legacy save shapes, and covers challenge slot/prestige transitions. The [readiness brief](rf02-readiness.md) additionally identifies two critical effects: `load/doLoad` mutate in-memory state (and old challenge migration can **save and reload**), while `storeSaveJson` may **swallow a quota exception**. Merely adding `JSON.parse` before `storeSaveJson` will not fulfill the recovery requirements. See the [test matrix](rf02-test-matrix.md) for exact original-byte preservation and fault injection.

## Source ownership and planned design

Inspect `saving.js` functions `processSave`, `save`, `load`, `doLoad`, `doSave`, `storeSaveJson`, `exportSave`/`exportSaveFile`, `importSave`/`importSaveFile`, `clearSave`, challenge transitions and option storage. Inspect `prestige.js` (`prestigeBackup`) and `google.js` for assumptions about the serialized payload. The structure below is a **separation of responsibilities**, not an already selected file layout:

- **Decode/validate:** classify `ILSV01` versus accepted legacy encoding, enforce finite size/valid JSON/expected top-level types and field ranges, and produce actionable non-destructive errors. Never write storage as part of decoding.
- **Pure migration:** transform a parsed value in memory to a known compatible in-memory save representation. Keep the old aliases (`Sell Gold`, `Buy Mana Challenge`, `Train Dex`, `maxTown`, `storyReqs`, `version75`, legacy options/challenges). Avoid mutating active game objects, queue or storage during this stage.
- **Serialization:** build persisted data from live state and preserve old field names/shapes (especially `storyReqs`, action `name`/`varName`, `ILSV01` envelope and expected extra options). Do not introduce a new externally visible format without separately accepted ADR.
- **Storage/transaction boundary:** hold a recoverable prior version and only commit a validated candidate when the application can load it safely. Define behavior when backup or new write fails due to quota. Avoid declaring multi-key `localStorage` operations atomic; rollback must be explicit and tested.

## In scope

- Reject invalid, truncated, maliciously oversized, wrong-type and otherwise incompatible imported saves **before** replacing the active slot.
- Preserve the prior active slot and any existing unrelated `prestigeBackup` or challenge save; provide a recoverable backup/retry/recovery path with clear UI outcome.
- Make migration functions deterministic and testable without browser UI side effects where possible. Retain ordinary, challenge and prestige lifetimes and `Data` snapshot assumptions.
- Centralize serialization and migration boundaries, potentially using small files/functions; keep compatibility adapters callable from legacy `saving.js` and cloud integration.
- Document the exact generated/normalized shape and accepted legacy formats using synthetic fixtures.

## Not in scope

Changing gameplay progression, actions, skill curves, challenge rules (RF04), resource semantics (RF03), Google OAuth/Drive behavior, save ownership of unrelated features or replacing the current `ILSV01` format with a new one. Do not silently import unknown fields into mutable globals.

## Acceptance criteria

- **A1 — Rejection is non-destructive:** for invalid JSON, invalid compressed text, missing or invalid fields, oversized input and quota failures, the exact pre-import bytes of the active save and previously existing recovery backups remain available; do not reload a partial state.
- **A2 — Valid imports work:** valid existing `ILSV01` exports and recognized legacy encodings are imported and produce the same effective progress, inventory-lifetime rules, queue, loadouts, story flags and challenge state as before (except documented safety corrections).
- **A3 — Migration is repeatable:** loading/migrating the same source twice is idempotent for relevant fields. Missing fields receive tested defaults, and old action aliases and dungeon/story transitions match original intended behavior.
- **A4 — Save roundtrip stability:** save → export → import → load → save remains semantically equivalent for current saves, across ordinary/challenge slots and prestige. Explicitly state which metadata can change (e.g. save time).
- **A5 — Recovery:** a valid backup can be restored through a documented path even if subsequent import fails; errors are surfaced without exposing raw private save contents.
- **A6 — Separated responsibilities:** decoding/validation/migration logic can be unit tested without a live `View`, and `doSave` retains the required public identity/compatibility contracts. Any API change has an ADR.
- **A7 — Regression:** normal restart, `beginChallenge`/`exitChallenge`/`resumeChallenge`, prestige, offline gain, action log, predictor and existing Chrome smoke still work. Tests demonstrate no unintended normal/challenge slot overwrite.
- **A8 — Safety tradeoffs explicit:** backup strategy, size bounds and whether imported saves with unknown extra fields are retained or rejected are explained with tests, not quietly assumed.

## Required tests

Start from RF01 F08–F09 and add:
1. A current export with `ILSV01` and old-compatible raw decode; compare semantic state before and after.
2. Synthetic legacy field sets with `maxTown`, old queue names, missing `prestigeValues`, `version75`/`storyReqs` and options.
3. Corrupt Base64, decompression-to-invalid JSON, syntactically valid wrong JSON shape, empty data (with confirmation) and storage-quota failure.
4. Incompatible version and extra/unknown fields, with explicit policy and safe error path.
5. Default and challenge slot independence, existing `prestigeBackup` preservation, abort/reload/retry, and export-after-import idempotency.
6. Chrome reload/recovery smoke plus worker-like fixture tests; no production Google account involvement.

## Implementation slices and handoff

Suggested implementation stages: (1) failing/characterization fixtures; (2) pure decode + normalized validation/migration API; (3) recoverable storage/commit boundary; (4) UI error handling + backward compatibility integration; (5) docs and end-to-end tests. Commit only completed slices that maintain readable legacy data. Rollback: revert the new import path while leaving backup data intact; document any new stored keys and how to read them with the previous build.

RF03 can proceed once RF02's serialization/resource representation and current slot/backup invariants are stable. Start only on separately authorized implementation request; do not merge without review.
