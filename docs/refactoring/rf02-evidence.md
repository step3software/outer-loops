# RF02 persistence safety — implementation evidence

**Status:** Implemented in [PR #6](https://github.com/step3software/outer-loops/pull/6), **unmerged and pending full CI/browser verification**. This PR is stacked on [RF02 preparation PR #5](https://github.com/step3software/outer-loops/pull/5), which remains open. No changes to action rewards, town indexing, gameplay balance, prestige progression or the existing export prefix have been made.

## What changed

- `save-import.js` is a standalone classic script exposing pure bounded decode, JSON/schema validation and the deterministic set of historically used action aliases. It is available to browser/worker and to the Node tests as CommonJS without accessing the DOM or storage.
- `saving.js` `processSave` now **preflights first**. Invalid compressed data, invalid JSON, incorrect types, suspicious unknown top-level fields, impossible zones, invalid challenge values and too-large payloads return a safe error **without touching the active slot or game state**.
- Import writes use an exact-byte `idleLoopsImportPendingV1` journal and verified `localStorage.setItem`/`removeItem` calls. The journal captures both game slots, `prestigeBackup`, `updateRate` and both existing import-recovery backups. If any write, live-load or backup rotation fails, prior bytes are restored and a partially mutated live session reloads. `startGame` also attempts journal recovery *before* loading a game after an interrupted import.
- `idleLoopsImportBackupV1_normal` and `idleLoopsImportBackupV1_challenge` retain the last successful pre-import save for the corresponding mode, without using or overwriting `prestigeBackup`. The save menu offers **Restore Previous Imported-Over Save** for the current mode; restoring through the same protected import mechanism rotates the new prior copy, permitting a further undo.
- Explicit **blank textbox** deletion retains its confirm-before-clearing-both-slots semantics and attempts to preserve recovery copies before deletion. Malformed nonempty data cannot enter the clear-save path.
- Imports carrying a legitimate challenge mode are installed in the challenge slot. When imported from normal mode, the normal saved game is preserved with the ordinary `inChallenge` marker; legacy inline `challenge` values are normalized without calling the old side-effecting `doLoad` reload branch. A normal-world export imported while a challenge is active is **rejected with an explanation** rather than silently replacing the challenge slot.
- Clipboard, file and cloud-origin input still calls `processSave`. No OAuth/Drive code is modified.

## Exact storage keys

| Key | Status | Role |
| --- | --- | --- |
| `idleLoops1` | Existing | Normal saved progression |
| `idleLoopsChallenge` | Existing | Original challenge-mode save |
| `prestigeBackup` | Existing, untouched by import backup rotation | Inherited prestige reset backup |
| `idleLoopsImportPendingV1` | New | Journal for rollback after interrupted/incomplete import; removed only on successful finalize or successful rollback |
| `idleLoopsImportBackupV1_normal` | New | Last successful pre-import normal save in `{version:1,slot,prior}` shape |
| `idleLoopsImportBackupV1_challenge` | New | Last successful pre-import challenge save in same shape |

A new successful import rotates the affected slot's backup. **A failed import must not replace any existing backup**. An unfinished journal has priority on next startup and restores the exact recorded previous values, even if a newer candidate had already been written. Distinct localStorage keys are **not atomically committed**; this explicit recovery design is why the journal remains until successful finalization.

## Compatibility and policy

- **External format unchanged:** `ILSV01` + LZString/Base64, plus the older Base64/LZW `decode` path. No exported version bump. Saved game fields still come from `doSave`; dynamic `exp*`/`total*` keys, `storyReqs`, skill/talent/buffs and original action IDs remain unchanged.
- **Pure normalization:** legacy queue/loadout aliases (Sell Gold, Buy Mana, Buy Mana Challenge, Train Dex, Tournament, Purchase Mana) and inline challenge-field mapping are side-effect-free and idempotent. Legacy `maxTown`, missing `version75` and older dungeon/story data continue to be applied by protected `doLoad`. Those remaining live migration callbacks are **not falsely described as fully pure**.
- **Input limits:** 4,000,000 encoded characters; 16,000,000 decoded characters; at most 400,000 traversed values, 80 levels of nesting, 50,000 queued entries and 64 loadouts. Sizes are **engineering safety limits**, not proven sufficient for every real historical save. The existing LZString decompressor is not streaming, so pathological expansion can allocate memory *before* the decoded-length check; stronger bounded decompression would require further work.
- **Unknown fields:** Unrecognized top-level keys are rejected rather than silently lost during `doSave`. Recognized historical and dynamic `exp/total/good/searchToggler` fields are accepted. Unknown extra data buried inside a known nested structure is not interpreted as a new gameplay entitlement.
- **Error UI:** errors identify categories, not raw imported save contents. Successful imports can be recovered from the Save menu. If browser storage quota prevents journal creation or backup rotation, the operation aborts/rolls back rather than pretending success.

## Regression evidence and execution status

The following **tests have been added** (they are not a claim that the entire GitHub Actions suite has already passed):

| Test | Coverage |
| --- | --- |
| `npm run test:rf02:preflight` | Pure validation, current/legacy decode adapters, idempotent alias mapping, challenge conversion, malformed/wrong-root/future-field/size rejection |
| `npm run test:rf02:transaction` | Runs the shipping transaction functions in a disposable Node VM with fault-injected localStorage; good import and restore, invalid inputs, journal/target/backup quota errors, apply-time throw, simulated interrupted boot recovery, challenge-slot separation and prestige-backup preservation |
| Extended `npm run test:browser` | Adds original browser imports with safe R01 rejection, wrong-root/compression safety, active/other-slot/backup byte retention, successful backup restore, legacy Base64/LZW import, challenge import/exit, journal/target quota failure; retains RF01 actual Chrome predictor, original challenge modes and prestige verification |
| RF01 original suites | All previous runtime action, legacy fixture, challenge, registry fingerprint, Chrome/Worker, XML and static checks preserved |

**Independent verification performed in the implementation conversation:** V8 parsed the production `save-import.js` and `saving.js` sources. The pure preflight script's cases and representative production transaction cases were executed using in-memory, fake-storage V8 harnesses and passed for successful import, malformed input, journal/target/backup quota exceptions, apply failure, interrupted journal recovery, last-save restoration and challenge/normal mismatch. This verification is *not equivalent to running the actual Node test files or real Chrome.* At the time this document was prepared, GitHub Actions had **not started a PR run for #6**; do not label RF02 "CI green" without checking new results.

### Prospective P01–P22 matrix coverage

See [RF02 planned matrix](rf02-test-matrix.md). P01–P06 and P09–P12/P14–P17/P21/P22 have explicit new or inherited scripted cases; P07–P08 are representative/idempotency-focused, not exhaustive across challenge and prestige exports; P13 checks fixed limits, not streaming decompression resource ceilings; P18 checks future top-level field rejection; P19 intentional deletion/confirmation and crash recovery are implemented but browser-level interactive confirmation is not fully tested; P20 reuses the shared cloud entry point without testing external Google APIs. **Do not claim all 22 cases end-to-end green** without real CI/browser evidence.

## Risks and follow-ups

1. **Real browser regression must run before merge.** There is no replacement for actual `processSave`, `doLoad`, Chrome reload, LZString, save UI and background Web Worker integration.
2. **Storage limits require sizing evidence.** Verify ordinary and large progressed saves and revise bounds through tests if legitimate saves are rejected. Avoid a strict schema that silently discards legitimate history.
3. **Unsaved in-memory progress:** on a failed apply requiring a reload, the exact pre-import persisted bytes are restored; activity since the last autosave is not guaranteed recoverable after a browser crash. Manual save/export before significant import remains recommended.
4. **Storage rollback under extreme quota:** if restoring journaled bytes also fails, the journal remains and the next launch retries. Users should **not clear site data**; export/recover the retained storage values.
5. **Existing R04/R08/R15** DOM-bound rules, Escape predicate side effects and God Trial predictor divergence are out of RF02 scope and remain open. R01 can only be marked fixed once real safe-import browser tests and review pass.

## Completion / rollback gate

This implementation is **reviewable but not verified complete** until A1–A8 have real test evidence from CI and browser. New recovery keys are additive and safe for older builds to ignore; reverting RF02 code retains the original exported format and existing save slots. Before rollback, a user can recover the last pre-import copy through the new UI or manually export those `localStorage` keys. The default `dmchurch` branch has not been changed by PR #6.

**Do not merge without explicit authorization.**
