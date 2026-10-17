# RF02 readiness — persistence safety implementation brief

**State:** Preparation completed; candidate implementation now in [PR #6](https://github.com/step3software/outer-loops/pull/6), **unmerged**. Based on `dmchurch` commit `3e74f16079d77fc5e5db947d7f97ad97cbff3cbc` (2026-10-17). [PRs #1–#4](https://github.com/step3software/outer-loops/pulls?q=is%3Apr+is%3Amerged) have been verified merged; the RF01 test foundation is present on the default branch. This briefing is documentation-only and does **not** change save behavior, authorize a code implementation, or merge anything.

**Canonical requirements:** [RF02 charter](RF02-persistence-safety.md) A1–A8. **Execute from:** [RF02 handoff](handoffs/RF02.md). **Fixtures and expected results:** [RF02 test/compatibility matrix](rf02-test-matrix.md). **Existing source contract:** [persistence audit](../audit/persistence-contract.md), [state guide](../state-and-saving.md), [RF01 evidence](rf01-evidence.md) and [finding R01](../audit/findings.md).

## 1. Readiness verdict

**Ready for implementation authorization**, based on the merged RF01 representative tests:

- Real Chrome `ILSV01` import/reload and **two different synthetic legacy combinations** (`maxTown`/`version75`/`storyReqs`, aliases and options).
- Normal/challenge slot isolation and **all three original challenge modes** entering and exiting through the real browser reload path.
- Original prestige completion, perk spending and `prestigeBackup` behavior in a disposable profile.
- One foreground/Web Worker vs actual Wander prediction; deterministic registry/action checks.
- **Reproduced unsafe import R01**: nonempty decoded invalid JSON overwrites `idleLoops1` before parsing throws. RF02 must turn this case from a documented *known defect* into a **failing-before / safe-after** test.

**Limitations, not hidden prerequisites:** The fixtures are reconstructed from an empty profile, not authentic historic saved files. RF01 does not prove that all historical exports, quota behavior, malformed schema, incomplete challenge migrations or all predictor actions work. RF02 must add focused tests for those gaps rather than assume them away.

## 2. Existing executable pipeline — source-verified

| Function/owner | Current behavior | RF02 boundary |
| --- | --- | --- |
| `saving.js processSave` | Checks for blank input (confirmation clears **both** ordinary/challenge slots), decodes `ILSV01` using LZString or uses the older `decode()` (Base64 + LZW), calls `storeSaveJson` on truthy result, then clears actions, invokes `load(null, saveJson)`, pauses and restarts | **Unsafe sequencing.** Decode/parse/validate in memory before any localStorage, active queue or live-state mutation |
| `saving.js load` | Calls `loadDefaults()` and UI initialization, parses JSON, changes `challengeSave`/`saveName`, calls `doLoad` | Loading is currently **mutating**, not a pure validity probe. An import that parses may still throw midway after damaging in-memory state |
| `saving.js doLoad` | Reconstructs towns/dungeons/trials, old `maxTown`, action names, `storyReqs`, `version75`, options, challenge state and snapshots | Some old `challenge` migrations even **call save() and reload**. These side effects must not happen during validation/normalization |
| `saving.js storeSaveJson` | Writes to `window.localStorage[saveName]`; quota failures are caught with a warning, and the caller may continue | A failed import commit must be **observable**. RF02 must not interpret a swallowed quota failure as success |
| `saving.js save/doSave` | Builds existing JSON (including dynamic `exp<varName>`, `total<varName>` fields), writes active slot and separately stores option `updateRate` | Preserve `doSave` field names, regular autosave behavior and external format; don't turn this into a full serialization rewrite |
| `saving.js beginChallenge / exitChallenge / resumeChallenge` | Mutates `saveName`, saves to `idleLoops1` / `idleLoopsChallenge` and may reload; `clearSave()` clears both | Import must have an explicit intended target and never change or erase the *other* slot inadvertently |
| `prestige.js prestigeConfirmation` | Uses **`prestigeBackup`** to safeguard a prestige reset (subject to existing conditions) | **Do not reuse or overwrite `prestigeBackup`** as an import backup |
| `google.js importFile` | Fetches saved cloud content and calls `processSave(response.body)` | The shared safe import entry point should cover cloud-origin input **without changing OAuth/Drive workflows** |
| `helpers.js decode` | Older Base64/LZW path; can fail on malformed encodings | Accept **documented** legacy formats with guarded decode and finite work/memory limits |

This is a classic-script global runtime, with browser `View` and predictor `Data` snapshots. The names and responsibilities in this table are **as coded**, not proposed new APIs.

## 3. Proposed implementation architecture (subject to ADR/scope review)

### A. Pure preflight first

For non-empty input, a **pure**, independently testable path should return a structured **candidate or typed error**:

1. Check input type and bounded length *before* attempting expensive decompression; distinguish current `ILSV01` from recognized old Base64/LZW input.
2. Decode to a string under bounded-resource policy, catch decode exceptions, reject empty output from nonempty invalid input.
3. Parse only object-shaped save roots (not arrays, `null`, strings or primitives). Validate critical present fields by type, **without treating legitimate historic optional omissions as invalid**.
4. Normalize only known migrations on a cloned candidate, retaining the original decoded representation where needed for compatibility and error recovery. Avoid `doLoad` side effects, browser DOM, `save()`, `location.reload` and `Data` mutations during preflight.
5. Reject definitely incompatible/future-version data with a clear explanation; don't silently prune substantial unrecognized state to pretend the import succeeded.

**Do not decide maximum byte limits or numerical caps from intuition alone.** Measure representative empty, progressed and synthetic-large saves; choose an explicit bound with headroom and test the just-under/just-over cases. A numeric `NaN` cannot survive normal JSON roundtripping, but parser depth, structure, arrays, unsupported field types and very large values still matter.

### B. Recoverable commit — recommended default

Treat import as an operation with an identified **target slot**, a **prior exact byte string**, a validated candidate, and a journal/recovery outcome.

- Before touching the intended active slot, preserve the **exact prior bytes** in an import-specific recovery location distinct from `prestigeBackup`, with a recorded target and recoverable instructions.
- **Never** overwrite a usable existing recovery copy *or* clear an unrelated save slot merely to create enough free quota. If the backup cannot be durably written, **abort** instead of continuing unprotected.
- Do not change live progression, action queues, challenge state, snapshots or options until the candidate has passed pure preflight.
- Ensure **successful application** before claiming an import succeeded. A remaining failure during `load/doLoad` must restore the previous target slot and recover the in-memory state via a controlled reload/rollback; prevent the existing legacy migration from writing either slot midway without protection.
- A single `localStorage.setItem` is effectively a single-key operation; **writes across two or more keys are not atomic**. Use explicit verification/rollback and test failure injection between backup, candidate and finalize steps. Avoid promising crash-safe transactions without proving recovery on next boot.
- Keep the original `ILSV01` envelope, current dynamic save keys and active save behavior. A new internal backup key or recovery marker is allowed only after documenting collision/retention, quota and old-build rollback implications in an ADR or equivalent approved contract.
- **Provisional policy:** one recoverable most-recent pre-import snapshot **per active slot** with a deliberate replace/rotation rule; keep existing `prestigeBackup` untouched. Final key names, retention count and manual restore UX must be selected and tested during the authorized milestone.

**Critical architecture decision:** Because `load` currently mutates state and `doLoad` can write/reload during old challenge migration, the implementation may need to separate **prepare** from **apply**, with a staged, recoverable commit and a boot-time rollback path. Simply moving `storeSaveJson(saveJson)` one line below `JSON.parse` **does not satisfy RF02**.

### C. Separate intentional deletion from malformed import

Currently importing an empty string can call `clearSave()` and delete **both** slots after a confirmation. RF02 should keep explicit confirmation semantics for deliberate clearing, but an empty, truncated or malformed **non-delete** import must not silently become a destructive operation. Confirm the exact target(s), preserve export/recovery instructions, and never mistake failed decompression for a request to erase saves. A redesign of all save-delete UX is **out of scope**.

### D. UI and external callers

- Preserve the existing clipboard, file, and cloud routes that call `processSave`. One validated entry point and comprehensible error reporting, without raw private save contents in an error toast or logs.
- Avoid changing the synchronous/public caller contract without auditing `importSave`, `importSaveFile` and `GoogleCloud.importFile`. If a promise-based import is necessary, update all callers deliberately.
- Do not add Google permissions, touch live accounts or change gameplay/challenge mechanics.

## 4. Compatibility contract

Retain these **existing** fields/behaviors: `idleLoops1`, `idleLoopsChallenge`, `prestigeBackup`, `ILSV01`, old Base64/LZW decoder, `maxTown`→`townsUnlocked`, story save key `storyReqs`, old `version75` dungeon conversion, queue/loadout aliases (`Sell Gold`, `Buy Mana Challenge`, `Train Dex`, `Tournament`, `Purchase Mana`), legacy `options`/`extraOptions`, original challenge routing and original prestige carryover.

**Semantic equivalence**, not byte-for-byte equality of two *valid successful exports*, is the goal: save `date` and `totalOfflineMs` can evolve, and `load` normalizes legacy data. For **rejected imports**, however, target-slot bytes and *previously existing* recovery slots must remain **exactly unchanged**. Reject or retain extra fields according to an explicit compatibility policy; unknown future Real World outer-state data must not be silently discarded by a supposedly safe import.

Document the storage key map and the legacy import/canonicalization table with source-backed fixtures; do not claim a complete authentic historic corpus.

## 5. Suggested slices for a future implementation PR

| Slice | Work | Proof / checkpoint | Cut line |
| --- | --- | --- | --- |
| **S0 — red baseline** | Extend merged RF01 tests for invalid JSON, invalid compression, wrong roots, failure-injection and both slots | Existing R01 demonstrably **red against desired safety contract**; no user-file effects | Tests may initially be explicitly expected-to-fail in a separate test commit; do not land red CI unintentionally |
| **S1 — pure decode/shape/migrate** | Introduce side-effect-free preflight, preserve `ILSV01` + old decode and recognized migrations | Node/VM tests for candidate/errors; no `localStorage` writes, action/state changes or DOM reads | If legacy migration cannot be pure, isolate its side-effecting portion before proceeding |
| **S2 — protected commit/restore** | Validate target, backup, commit/readback, rollback + interrupted-boot recovery | Inject backup quota, active write quota, mid-apply throw and reload; exact byte retention | No successful import unless a restore path really works |
| **S3 — caller/UI compatibility** | Integrate existing paste/file/cloud surfaces and explicit-delete flow; preserve challenge/prestige semantics | Chrome synthetic current/old/challenge tests, human-readable errors | Do not add online OAuth integration or rewrite challenge modes |
| **S4 — docs/verification** | Update state/persistence contract, findings and optional ADR; rerun entire suite | [RF02 matrix](rf02-test-matrix.md) and A1–A8 green with known gaps stated | Open **separate implementation PR**; leave unmerged |

**Strong preference:** one focused RF02 implementation PR with individually reviewable commits, not five permanently divergent behavior branches. If the protected transaction/API needs a genuinely incompatible external format, stop and obtain a separate ADR approval before changing it.

## 6. Rollback and review gate

Before accepting RF02 code, show all eight charter requirements [A1–A8](RF02-persistence-safety.md) as tested, with the [test matrix](rf02-test-matrix.md) and actual browser/worker output. Verify the **existing production save schema did not change** or specify any deliberate additive recovery keys.

Rollback of runtime code must leave player data readable by the prior build. Do **not** rely on code rollback alone if the implementation has already written new storage keys or altered serialized data; include a restore/export plan. Keep the source risk R01 marked **open** until an actual, passing safe-import PR is reviewed and merged.

## 7. Handoff request

When implementation is explicitly authorized, use [the prepared handoff](handoffs/RF02.md) and [this matrix](rf02-test-matrix.md), create a fresh `fix/rf02-persistence-safety-*` branch from the then-current `dmchurch`, implement S0–S4 with synthetic data only, open a PR and **do not merge**.

**No implementation is authorized by preparing this brief.**
