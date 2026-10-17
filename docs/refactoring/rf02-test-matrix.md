# RF02 — prospective safety and compatibility test matrix

**Status:** Acceptance matrix for RF02. A subset of automated checks has been added in **unmerged [PR #6](https://github.com/step3software/outer-loops/pull/6)**; see [RF02 evidence](rf02-evidence.md) for what was actually run versus still unverified in real Chrome/CI. The merged [RF01 evidence](rf01-evidence.md) covers a subset of positive compatibility cases and **reproduced R01**, but its existing browser test currently **expects/detects** an unsafe import. RF02 must turn that behavior into a **non-destructive rejection assertion** without suppressing or weakening valid-save coverage.

Use disposable synthetic data only; never real player exports, OAuth credentials or a normal browser profile. Run exact-slot-byte assertions when rejecting input. Run semantic comparisons (not raw JSON equality) after successful imports. Canonical implementation criteria remain [RF02 A1–A8](RF02-persistence-safety.md).

## 1. Synthetic fixture catalog

Start from `scripts/rf01-fixtures.mjs` in merged `dmchurch`. Extend it with a **pure fixture builder**, deterministic time/seed where practical, a captured `doSave()` baseline and safe localStorage fault injection; keep fixture files compact and intent-labeled.

| Test | Inputs, mode or injected failure | Required assertion | RF02 gate |
| --- | --- | --- | --- |
| **P01 — current import** | Valid `ILSV01` from a blank disposable game, with progressed Wander/queue | Same intended town progress, queue names/counts, normal slot, skills, flags and live browser after reload | A2/A4 |
| **P02 — reconstructed pre-v75** | Missing `version75`, `maxTown` and old `storyReqs` + action/loadout aliases | Migrated world unlocks, small-dungeon counters, story flags and aliases match pre-RF02 behavior | A2/A3 |
| **P03 — alternative legacy** | Old `Sell Gold`/`Buy Mana Challenge`/`Tournament`/`Train Dex`/`Purchase Mana`, options/extraOptions absent/mixed | Migrated actions and loadouts remain legal, no duplicate queue rows, no unintended missing options | A2/A3 |
| **P04 — older encoding** | A valid old Base64/LZW `encode()` payload from synthetic save | Legacy `decode()` path accepted; import and export remain semantically consistent | A2 |
| **P05 — challenge save** | In-challenge mode 1, 2 or 3 with both normal and challenge slots prefilled | Intended destination explicit; other slot bytes preserved, mode and restart semantics retained | A2/A4/A7 |
| **P06 — original prestige** | Saved completion, purchased old `PrestigeCombat` and `prestigeBackup` prefilled | Prestige values/buffs and existing `prestigeBackup` remain intact across successful/failed imports | A2/A5/A7 |
| **P07 — save→export→import→save** | Valid normal save, then challenge save and a legacy-shaped save | Persistent meaningful fields equivalent after normalization; date/offline metadata exceptions documented | A3/A4 |
| **P08 — repeated migration** | Same migrated synthetic source twice, including `version75` absence | No extra floors/rewards, story events or challenge migration/reload loops; expected idempotent normalized state | A3 |

## 2. Rejection must not mutate saved or live data

For **each rejection**, record exact initial bytes of both `idleLoops1` and `idleLoopsChallenge`, existing import recovery keys (if defined), `prestigeBackup`, a representative live progression/queue signature and an error outcome. A rejected import must leave both save slots and previously existing backup bytes unchanged and must not trigger a surprise page reload.

| Test | Bad input or failure | Expected result | RF02 gate |
| --- | --- | --- | --- |
| **P09 — truncated encoded payload** | `ILSV01` with incomplete Base64/compression | Reject cleanly; no active/other slot/backup change | A1 |
| **P10 — decodes to bad JSON** | `ILSV01` encoding `{"nextList":` (RF01 R01 reproduction) | Reject **before storage**, previous exact bytes intact; existing RF01 "known unsafe" warning replaced with a safe assertion | A1 |
| **P11 — incompatible root** | Valid JSON `null`, `[]`, primitive, or object with `stats: []` / `buffs: null` | Clear structural error, no partial world mutation | A1/A8 |
| **P12 — incompatible fields** | `nextList` is a string; `loadouts` malformed; `townsUnlocked` contains invalid indices; invalid challenge mode | Reject or safe-normalize only according to documented policy; never crash or lose previous slot | A1/A8 |
| **P13 — oversized input** | Encoded and decoded length just below/above approved size boundary; deep/large arrays | Bounded validation and actionable rejection; no unbounded memory work | A1/A8 |
| **P14 — backup quota error** | Synthetic localStorage throws quota failure when creating import recovery | Abort before changing active state; preserve existing backup and both original slots byte-exact | A1/A5 |
| **P15 — active write quota error** | Backup succeeds, candidate write fails | Original active/other slots intact and recoverable backup exists; no false success | A1/A5 |
| **P16 — apply-time failure** | `doLoad` throws after parsing/migration or during options/story/queue initialization | Restore previous slot and recover live state through controlled reload; no partial "success" or infinite boot failure | A1/A5/A6 |
| **P17 — interrupted transaction** | Simulated interruption between backup, candidate and successful finalization; reload | Reopen a valid prior/candidate save using documented recovery marker/selection; no unrecoverable partial reset | A5/A8 |
| **P18 — missing/unknown fields** | Optional legacy fields omitted; inert new fields or explicit future-version marker supplied | Tested whitelist/ignore/preserve/reject policy; don't accidentally delete future outer-state data | A2/A3/A8 |
| **P19 — blank import / deliberate delete** | Empty textbox, invalid decompression to empty, explicit confirmed deletion, cancellation | Empty decoded garbage does **not** imply deletion; cancellation changes nothing; intentional clear requires explicit confirmation and backup policy | A1/A5/A8 |
| **P20 — cloud-origin import** | Synthetic call to `processSave` as used by `GoogleCloud.importFile`, no live API | Same validation/recovery as clipboard/file; no extra OAuth change | A2/A6 |
| **P21 — recovery restore** | Explicit restore of last successful pre-import backup for intended slot | Exactly original bytes recovered and playable after reload; other slot and `prestigeBackup` untouched | A5 |
| **P22 — import during challenge** | Active challenge, normal slot holds valuable progress; import or malformed input in that session | Never write the wrong slot due to `saveName` or `challengeSave.inChallenge` redirection; return-to-normal path still works | A1/A7 |

## 3. Cross-mode regression and failure semantics

Preserve and rerun **all existing** commands from [development validation](../development/validation.md), including:
`npm run check`, `npm run test:model`, `npm run test:action`, `npm run test:rf01:model`, `npm run test:rf01:challenges`, `npm run check:mechanics`, `python3 scripts/check-xml.py`, `npm run test:browser`.

Specific downstream checks: normal loop `restart()`, current-vs-next queue, all three original challenge modes and their two localStorage keys, `prestigeWithNewValues`, the user-facing file/clipboard import controls, offline credit after realistic save dates, action log and story flags, and foreground/worker predictor on at least one synthetic imported save. Unknown R15 Gods Trial parity is **not** to be fixed incidentally here.

### Comparison contract

- **Rejection:** exact old `localStorage` bytes (string equality), prior `prestigeBackup` and recovery bytes and live-state fingerprint unchanged; no unexpected switch of `saveName` or `challengeSave` mode.
- **Successful import:** compare normalized `townsUnlocked`, selected `exp*`/`total*`/`good*` counters, skills/talents/buffs, `prestigeValues`, queue (name/repetitions/disabled/`loopsType`), loadouts, `storyReqs`/`storyVars`, trials/dungeons, options and both storage targets; allow expected timestamp/offline/derived display differences only when explicitly documented.
- **Fallback:** if a valid synthetic prior save exists, user can recover it after a failed apply, quota error or interruption. Explain whether restore occurs automatically or via a clearly labeled user action.
- **No false passes:** expected failures from the original R01 bug belong to the pre-fix proof. Once the repair is merged, R01 must be **asserted absent**, not printed as a permanent warning.

## 4. Acceptance crosswalk

| Charter | Must be evidenced by |
| --- | --- |
| **A1** No destructive rejection | P09–P17, P19, P22 |
| **A2** Existing format compatibility | P01–P06, P18, P20 |
| **A3** Idempotent migration | P02–P04, P07–P08, P18 |
| **A4** Semantic roundtrip | P01, P05–P08 |
| **A5** Real recoverability | P14–P17, P19, P21 |
| **A6** Pure components | Unit preflight tests + P16/P20 proving no DOM/storage mutations in validation |
| **A7** Cross-mode regression | P05–P06, P22 and entire RF01/Chrome/predictor suites |
| **A8** Decision transparency | Written size, extra-field, backup rotation and old-build rollback policy with edge tests |

## 5. Unresolved technical decisions to settle in the implementation PR

1. Backup key naming/retention and when a prior import backup may be superseded—**never replace `prestigeBackup`**, and never discard a backup on a *failed* new import.
2. Byte/structural limits that prevent denial of service but don't reject legitimate progressed saves.
3. Recognition and preservation policy for unknown valid extra fields or incompatible future save revisions.
4. Transaction ordering and recovery when `doLoad` or old challenge migration would normally call `save()`/`location.reload` during application.
5. Confirmation and recovery UX for explicit empty import/deletion, distinct from a corrupted payload.

**These are proposals, not implementation or proof of safety.** Don't start coding from this checklist without a separate RF02 implementation request.
