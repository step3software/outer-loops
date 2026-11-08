# ADR 001 — Recoverable legacy-compatible save import

**Status:** Proposed in [draft RF02 PR #16](https://github.com/step3software/outer-loops/pull/16); not adopted on main.
**Owner decisions:** RF02-D01 A (main canonical source), RF02-D02 A (one prior save per slot plus journal), RF02-D03 A (reject incompatible unknown fields). Implementation authorization does not authorize merging or deployment.

## Context

The original processSave persisted untrusted imported JSON before parsing it. load/doLoad mutates live progression and historical challenge migrations can save/reload during application. localStorage writes across separate keys are not atomic. The existing prestigeBackup belongs to a separate prestige reset.

## Candidate architecture

1. Preserve the external ILSV01 envelope and recognized historical Base64/LZW imports without changing doSave field identity, action names, varNames, zone numbering or gameplay.
2. Run pure SaveImport.prepare before modifying state or storage. Bound input length, decoded size, JSON shape, nesting, queue/loadouts and finite values. For ILSV01 Base64, bound LZString output while decompressing, rather than only after expansion.
3. Reject unsupported top-level fields and dynamic action fields not associated with a current action varName. Apply documented legacy aliases without mutating the input.
4. Before a validated import, save idleLoopsImportPendingV1: an exact-byte snapshot of both game slots, existing import backups, prestigeBackup and updateRate.
5. Verify target writes and successful application; rotate one last successful pre-import backup for each affected slot (idleLoopsImportBackupV1_normal / idleLoopsImportBackupV1_challenge), then remove the journal. On failure, recover original bytes. On startup, replay an interrupted journal before game initialization.
6. Preserve the unrelated slot and the prestige backup. Reject normal-world imports while an active challenge is selected instead of silently redirecting their destination.
7. Treat confirmed blank-import deletion as a separate journaled transaction; do not remove the journal until both slots and backups have been verified. Malformed data never implies deletion.
8. Restore a backup through the same protected import path. Show errors without raw save contents.

## Tradeoffs

- A journal temporarily duplicates saved strings and can exhaust browser quota, so protected imports may abort. One backup per slot limits recovery history.
- The original legacy Base64/LZW decoder remains bounded by input and post-decode limits, not a streaming decompressor. Its extreme-expansion risk remains a documented limitation.
- Recovery protects exact previously persisted bytes, not all unsaved gameplay since the last autosave.
- Rejected alternatives: changing the export envelope, reusing prestigeBackup, ignoring quota exceptions, or accepting unknown future data that the serializer would discard.

## Verification and rollback

Acceptance remains governed by [RF02 A1–A8](../refactoring/RF02-persistence-safety.md), [P01–P22](../refactoring/rf02-test-matrix.md), and the [RF02 evidence ledger](../refactoring/rf02-evidence.md). Isolated V8 functionality checks do not substitute for complete Node, CI, Chrome and Worker regressions.

The additional storage keys are additive, and older builds ignore them. Before reverting to an older build, export or recover the pre-import copy if needed. Keep the implementation in a draft PR until review and separate merge authorization.
