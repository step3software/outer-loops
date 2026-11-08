# RF04 — Implementation preparation

**Status:** Owner accepted the RF04 plan in this conversation on 2026-11-08. This is a **file-level preparation candidate**; approval of this exact preparation and a separate implementation grant remain outstanding. Orcha's published legacy `workflow/records.json` still reports RF04 as `proposed`, with no official accepted-plan hash/receipt; do not misstate that host stage.

**Machine-readable contract:** [RF04.preparation.json](RF04.preparation.json) — complete paths, operations, A1–A8 coverage, exact tests and handoff.

**Accepted plan source:** [RF04 source specification](RF04-challenge-rule-isolation.md) · [Owner decisions Q01-A, Q02-A, Q03-A](RF04-challenge-rule-isolation.md#owner-decisions--recorded-2026-11-08) · [Plan JSON](RF04.plan.json) · [draft plan PR #19](https://github.com/step3software/outer-loops/pull/19).

**Pinned accepted-plan PR head:** `b88f46e8566d7c0711bf90f2df75a7625621d612`  
**Pinned runtime `main`:** `1815ad7b52e9b976e92f11b845309bd9e0d80724` (merge of RF03 PR #18)  
**Plan JSON SHA-256 (content digest, not host approval receipt):** `7e8c288a71482c8c0a14a41a143554b5337aed39535e6c64e9dd112115b2a97d`  
**Published Orcha `main`:** `b8bf6bf07073823d108fd356c48916ea0cafd615`  
**Intended implementation branch (not created):** `refactor/rf04-challenge-rule-isolation`

## Execution design

One RF04 milestone, two internal testable implementation seams:

1. **Stable policy and Mana Drought:** characterize old mode 0–3 behavior; implement the shared `challenges.js` mode dispatcher; preserve stable `Action.BuyManaZ1`/Z3/Z5 callbacks, mode 1 purchase bounds and visibility, and normal restoration. Capture reference identities and exact resource/merchant results.
2. **Combat, restart, prediction and lifecycle:** preserve mode 2 zombie/team strength, mode 3's exact original time budget and special reset omissions, save/load/exit/resume behavior, and correct foreground/Worker forecast mode and merchant budget. Extend deterministic model and disposable real-Chrome tests. Submit one focused implementation PR.

## Critical source findings

- `challenges.js` currently overwrites six action callbacks in mode 1, two global combat functions in mode 2 and global `restart` in mode 3; `loadChallenge()` runs from `saving.js` after restoring save data.
- The main page already loads `challenges.js` **after** `saving.js` and before `predictor.js`; `predictor-worker.js` does **not** import it. Preserve this order, adding an explicit Worker inclusion after `saving.js`.
- `predictor.js` has separately coded normal-combat helpers and `isManaDrought` / `manaBought=7500` forecast state. The Worker has default `challengeSave` because that object is not a snapshot root. Forecasts must pass mode and merchant budget explicitly and cache those inputs; never assume Worker-global mode is current.
- `saving.js` registers `totalMerchantMana` in snapshot-virtualized globals and owns `idleLoops1`, `idleLoopsChallenge`, `ILSV01` and RF02 recovery. Do not change persisted formats or transaction semantics.
- The mode 3 override intentionally lacks the normal restart's `currentLoop` and `Data.updateSnapshot` paths. Under owner RF04-Q03 A, reproduce and characterize the existing behavior, including `totals.effectiveTime >= 86400`, without clamping.
- Legacy mode 1 hides Buy Mana Z3/Z5 via `visible()` only; do not assume `canStart()` blocks an already queued action.

## Verification and constraints

The implementation must pass every command listed in [the executable contract](RF04.preparation.json), including `npm run test:rf04:model`, existing RF01–RF03/RW00 suites, `npm run test:browser` (actual foreground/Worker/Chrome), `npm run check`, `npm run check:mechanics` and XML validation. Numerical parity is exact for discrete values, with documented field-specific tolerance for floating-point values. Collect a mode-by-mode matrix and an RF04 evidence ledger; do not substitute static parsing for browser/Worker verification.

**Documentation-only preparation:** No application source files, tests, CI workflows, save bytes, active scheduling, or runtime behavior are changed by this branch. No local `npm`, Chrome, XML or CI checks have been executed as part of this preparation. Before implementing, re-observe current source/PR heads, writer ownership and Orcha approval state; the existing draft plan PR remains a prerequisite.

**Handoff:** [RF04 implementation prompt](handoffs/RF04.md). Acceptance of the present preparation is **not** automatic authorization to implement, merge or deploy.
