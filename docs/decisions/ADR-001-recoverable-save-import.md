# ADR 001 — Recoverable legacy-compatible save import

- **Status:** Proposed implementation contract in [RF02 PR #6](https://github.com/step3software/outer-loops/pull/6); **not adopted until reviewed/merged**.
- **Date:** 2026-10-17
- **Scope:** The current Idle Loops browser save import pipeline; Real World outer-state migration is a separate future design.

## Context

The original `processSave` stores untrusted imported JSON **before parsing it**, which RF01 reproduced as R01. The current `load/doLoad` pipeline can mutate world state, switch challenge save slots and trigger saved-data writes or reloads during historical challenge migration. `localStorage` cannot atomically commit several keys. The original `prestigeBackup` is a separately owned and valuable recovery record.

## Decision proposed

1. Keep the **`ILSV01` export prefix** and old Base64/LZW import compatibility; `doSave`'s payload schema remains unchanged.
2. Introduce `SaveImport.prepare` as a side-effect-free decoded/parsed/validated candidate. Alias and inline-challenge normalization occurs on a clone; some complex original `doLoad` migrations remain protected by the transaction rather than being misrepresented as pure.
3. Before applying a valid import, write a **single pending journal** snapshotting exact bytes of normal/challenge save slots, prestige backup, option update rate, and existing last-import backups. Verify writes, apply, then rotate import backups and remove the journal.
4. On any failed commit, load or recovery write, restore exact old slot bytes; on startup, pending journal recovery runs **before `load`**. An incomplete rollback leaves the journal intact for retry. Distinguish an explicit deletion request from invalid nonempty text.
5. Keep a **single last successful pre-import copy per slot** in import-specific keys; never overwrite `prestigeBackup`. Expose user confirmation to restore the current mode's prior copy; restoration itself uses the protected import.
6. Reject unknown top-level fields rather than silently dropping data from future game versions. Use bounded input size/structure checks, document limits and measure legitimate save sizes before final approval.
7. For current challenge imports, keep challenge mode in the challenge slot and preserve normal progression behind the existing `inChallenge` marker. For a normal-save import during an active challenge, explicitly reject wrong-slot overwrite.

## Alternatives rejected for this implementation

- **Parse then store** without backups: the parsed shape may still cause `doLoad` to throw or partially mutate the world.
- **A second prestige backup**: would overwrite a valuable unrelated veteran recovery copy.
- **A new export format/server backend**: unnecessary and incompatible with the charter's scope.
- **Silent best-effort quota failure**: lets callers falsely claim a saved game was committed.
- **Multi-key atomicity assumption**: not provided by browser `localStorage`.

## Tradeoffs / uncertainties

The pending journal duplicates save strings, which costs quota and can cause safe imports to fail rather than risk progress loss. A legitimate save with unknown fields is rejected (the user retains the original file) rather than imported with silently lost data. The old LZString decoder is non-streaming, so a compressed expansion bomb can allocate memory before post-decode size checks. Retention of only one previous version per slot does not provide indefinite save history. A failed apply can recover the previously **persisted** bytes but cannot always recover play since the last autosave after a crash.

## Compatibility and review gate

The change must pass [RF02 A1–A8](../refactoring/RF02-persistence-safety.md), [P01–P22](../refactoring/rf02-test-matrix.md) where applicable, and all merged RF01/browser/challenge/prestige tests. If quota or migration simulation breaks expected compatibility, revise this proposal before merging. No gameplay rules, action IDs, worker formulas or external cloud auth behavior may be changed for RF02.
