# RF04 — Challenge rule isolation

**Lifecycle:** Existing RF04 charter approved as a planning scope. This revised plan is **proposed for owner review**, not an accepted plan or implementation grant (2026-11-08).
**Repository:** `step3software/outer-loops` · **Source:** `main` at `1815ad7b52e9b976e92f11b845309bd9e0d80724`, the merge commit of [RF03 PR #18](https://github.com/step3software/outer-loops/pull/18).
**Dependencies:** RF01 [#4](https://github.com/step3software/outer-loops/pull/4), RF02 [#16](https://github.com/step3software/outer-loops/pull/16) and RF03 [#18](https://github.com/step3software/outer-loops/pull/18) are merged in source; their specific verification gates must still be checked.
**Implementation handoff:** [Existing RF04 handoff](handoffs/RF04.md) — informational until a separately accepted plan, preparation and implementation authorization.

## Objective

Replace challenge-time mutation of action methods and global function declarations with one explicit, deterministic challenge-policy boundary. Preserve the three original challenge modes, their save-slot lifecycle and normal-mode behavior while making foreground/worker prediction consistent with the chosen mode. This is a compatibility refactor, not the eventual Real World redesign.

## Source-grounded baseline (2026-11-08)

| Mode | Observed production path | Behavior to characterize and preserve |
| --- | --- | --- |
| **0 — normal** | [`actionList.js`](../../actionList.js), [`stats.js`](../../stats.js), [`driver.js`](../../driver.js) | Default merchant pricing, combat, restart budget and action visibility; no challenge-specific rule leakage. |
| **1 — Mana Drought** | [`challenges.js`](../../challenges.js) replaces six `Action.BuyManaZ1`/Z3/Z5 callbacks and sets `gameSpeed = 2`. | Z1 `canStart` requires `totalMerchantMana > 0`; mana cost 1, gold rate 30, spending `min(gold,300)` per purchase, purchase `min(spendGold * 30,totalMerchantMana)`, merchant balance decremented, Z3/Z5 hidden. |
| **2 — Noodle Arms** | `challenges.js` replaces global `getSelfCombat` and `getTeamCombat`. | Self = `max(getZombieStrength(), getTeamStrength()) / 2`; team = `getZombieStrength() + getTeamStrength()`, with underlying buff/prestige/skill multipliers unchanged. |
| **3 — Mana Burn** | `challenges.js` replaces global `restart`. | `timeNeeded = 4320000 - totals.effectiveTime * 50` on restart; mode-specific reset order and queue behavior as observed. The override currently omits normal restart's `currentLoop` assignment and `Data.updateSnapshot`, an explicit parity risk, not permission to change balance. |

[`saving.js`](../../saving.js) stores normal/challenge saves in `idleLoops1` and `idleLoopsChallenge`, calls `loadChallenge()` during load, and uses `beginChallenge()`, `resumeChallenge()` and `exitChallenge()` to transition. Exit currently reloads the page. [`predictor-worker.js`](../../predictor-worker.js) does **not** import `challenges.js`, and [`predictor.js`](../../predictor.js) contains independent default-combat helper formulas: mode propagation/parity cannot be assumed. [RF01 characterization](../../scripts/test-rf01-challenges.mjs) currently expects monkey-patched function identities, so retain its numerical baseline but replace that *specific* old-implementation assertion with stable-reference assertions only after baseline capture.

## Included scope

1. A small challenge context/policy for mode 0/1/2/3, selected explicitly from loaded game state. Stable `restart`, combat functions and `Action.BuyManaZ1` callbacks dispatch through the chosen policy without overwriting executable function identities. Keep rule/predicate evaluation independent of the DOM.
2. Preserve mode 1 action admission, visibility, purchase bounds, merchant balance, 2× speed, timer and queue effects; mode 2 strength formulas; mode 3 restart arithmetic and sequencing. Preserve standard gameplay and prestige behavior outside challenges.
3. Preserve existing `challengeSave` fields, both save slot names, `ILSV01` import/export, RF02 recovery/journal keys, existing overwrite confirmation, legacy challenge migration, resume and explicit reload-on-exit behavior. Mode selection must not leak after loading a different slot.
4. Propagate the same challenge context to foreground prediction and the real Worker, including `Data` snapshot import/reset/cache invalidation. Address existing mode-specific predictor discrepancies as narrowly as needed to satisfy RF04 parity, without changing gameplay rewards.
5. Extend RF01/RF02/RF03 regression fixtures and real-browser tests with stable identities, same-page policy selection, mode transitions, save/import/reload and explicit foreground/worker parity.
6. Document the durable rule contract in an ADR if the interface changes a long-lived runtime API; refresh architecture, state/save, predictor and code-map ownership documentation during the separately authorized implementation.

## Excluded scope

No new challenges, removal or retirement of legacy modes, timeline-variant conversion, new Real World/Totem/Potion mechanics, balancing or minimum-timer correction (RF04-Q03 A), new save fields/schema, action renaming/reordering, tenth town, action-module split (RF05), view overhaul (RF06), runtime bundler/framework, cloud/account operations, deploy or merge.

## Proposed architecture and delivery

**One RF04 implementation milestone, two internal verification seams (not additional milestones).** The preferred design is a single small policy dispatcher/lookup in the existing classic-script runtime, with policy decisions made from explicit state rather than reassigned function declarations. Preserve existing action and global entry points; centralize mode-specific arithmetic in the existing owning files instead of scattering `if (challengeMode)` throughout unrelated actions. Share the policy with the Worker by a verified script inclusion and snapshot/run-data contract, not by assuming globals or DOM exist there. **RF04-Q02 A is owner-selected:** keep the compact shared policy dispatcher in existing `challenges.js`, with stable consumers and explicit Worker inclusion. Preparation must verify the actual classic-script/Worker load sequence and preserve this choice; any material deviation needs renewed owner direction.

1. **Characterize and establish policy:** freeze mode 0–3 numeric/queue/save outputs from the PR #18 source, including `Action.BuyManaZ1` and global function identities. Extend deterministic source-backed fixtures before changing behavior; document mode ownership, policy read API and snapshot requirements. Implement the central selection seam and mode 1 with identical foreground outcomes.
2. **Migrate and prove remaining policies:** move mode 2 combat and mode 3 restart selection into stable dispatch. Reconcile initialization, speed reset, browser reload, challenge-slot restore/import and foreground/Worker prediction. Remove remaining runtime overwrites only after comparing all characterized outputs. Produce one focused implementation PR with an ADR if applicable, test evidence and a rollback path.

Implementation should make reversibility obvious: reverting code preserves current save bytes and the RF02 recovery mechanism; no data migration is necessary. A merged prerequisite is not a substitute for testing: verify the RF03 browser, worker and CI gates against the actual source before relying on them.

## Acceptance criteria (retain established A1–A8)

- **A1:** Mode 0 and all three challenge modes reproduce the frozen pre-refactor player-visible action, resource, combat, speed, queue and restart outputs for identical synthetic states, with any justified numeric tolerance stated.
- **A2:** Within one JavaScript realm, references to global `restart`, `getSelfCombat`, `getTeamCombat` and the mode 1-affected `Action.BuyManaZ1`/Z3/Z5 methods stay stable through selection, load, import, resume and exit; a fresh page load constructs fresh definitions with the same non-patched contracts. No mode replaces those functions at runtime.
- **A3:** Challenge entry affects only the intended challenge slot, preserves normal data and RF02 backup/recovery contracts, respects overwrite confirmation, and resumes/exits without stale challenge policy.
- **A4:** Mode 1 produces exact purchases and `totalMerchantMana` values at zero, small and cap-exceeding gold/merchant amounts, keeps Z3/Z5 unavailable, and retains 2× speed only while appropriate.
- **A5:** Mode 2 self/team/zombie combat matches baseline at zero and nonzero teams/zombies and representative Feast, Ritual, prestige and guild/skill modifiers.
- **A6:** Mode 3 restart matches recorded values and queue/town/timer outcomes around representative and boundary `totals.effectiveTime` values. Any non-positive budget correction is a separately approved deviation, not an implicit refactor.
- **A7:** Foreground and real Worker predictions select identical policies and match actual mode-specific queued-action outcomes on field-level comparisons. Snapshot restoration and cache reuse cannot silently change mode.
- **A8:** Mode transitions `0→1→0`, `0→2→0`, `0→3→0`, import, reload, challenge resume, normal/prestige loops and basic browser UI pass all affected regression checks.

## Verification matrix and gates

| Area | Required planned evidence |
| --- | --- |
| Baseline | Frozen pre-edit RF01 `test:rf01:challenges` outputs, field-level model fixtures and normal-mode control for all modes. Distinguish formerly *expected mutations* from frozen gameplay values. |
| Mode 1 | `gold=0/12/300/400`, `totalMerchantMana=0/low/7500`, exact Z1 rewards and bounds, Z3/Z5 queue visibility, normal→challenge→normal speed restoration. |
| Mode 2 | Zero and nonzero undead/team combinations, buffs, skill/armor, prestige, action combat, foreground and Worker prediction. |
| Mode 3 | `totals.effectiveTime` near 0, 86,399, 86,400 and 86,401; restart counters, queue, town reset, snapshots and continuation. Record and flag legacy non-positive behavior without changing the formula (RF04-Q03 A). |
| Persistence | Existing save, fresh challenge, confirmed/rejected overwrite, legacy inline challenge import, normal/challenge slot isolation, RF02 backup/rollback, exit/reload/resume and `ILSV01` export/import. |
| Integration | `npm run check`; `npm run test:model`, `test:action`, `test:rf01:model`, `test:rf01:challenges`, `test:rf02:preflight`, `test:rf02:transaction`, `test:rf03:model`, `check:mechanics`, `test:browser`; new RF04 deterministic and Chrome Worker parity tests; `python scripts/check-xml.py`. Capture exact outcomes and skipped checks. |

Use isolated test profiles and synthetic saves only; never commit player saves or exercise cloud credentials. See [cross-milestone matrix](validation-matrix.md) and [validation guide](../development/validation.md). These checks are **planned**, not reported as executed for this planning-only branch.

## Owner decisions — recorded 2026-11-08

The owner explicitly selected **A** for RF04-Q01, **A** for RF04-Q02 and **A** for RF04-Q03 in the RF04 planning conversation referring to [draft PR #19](https://github.com/step3software/outer-loops/pull/19).

| ID | Owner-selected answer | Scope consequence |
| --- | --- | --- |
| **RF04-Q01 — Legacy compatibility scope** | **A — Preserve all three original challenge modes as a compatibility layer.** | Preserve the existing A1–A8 behavior and veteran-save contracts. Do not replace the approved RF04 scope with future Real World timeline variants; see [Real World integration](../design/outer-loop/integration-with-refactoring.md). |
| **RF04-Q02 — Rule ownership** | **A — Compact shared dispatcher in existing `challenges.js`, with stable consumers and explicit Worker inclusion.** | Keep the script surface small, verify Worker import ordering and snapshot propagation, and document the stable API in an ADR when implemented. Do not silently choose a new policy file. |
| **RF04-Q03 — Non-positive Mana Burn duration** | **A — Preserve the original `4320000 - totals.effectiveTime * 50` formula, including non-positive results.** | Characterize and flag the boundary at `totals.effectiveTime >= 86400` without clamping or rejecting it. Any correction is a distinct, newly authorized change. |

**Authority boundary:** These selections resolve the three **design questions only**. They do **not** constitute separate acceptance of this revised plan, preparation/implementation authorization, PR merge approval or deployment approval. The existing A1–A8 charter stays in force; RF03 decisions D05/D06 remain unchanged.

## Risks, compatibility and documentation review

- **Mode drift:** current `loadChallenge()` mutates executable objects while challenge exit reloads. Deterministic same-page selection is useful only when it preserves actual slot transitions and reset behavior.
- **Prediction drift:** Worker lacks `challenges.js`; prediction helpers encode normal combat. Missing state registration, imported snapshot roots or stale caches may silently misrepresent challenge action times.
- **Mode 3 reset divergence:** replacing the override with the normal restart path without studying its missing `currentLoop` / snapshot work could change actual outcomes. Capture both paths before deciding what to preserve.
- **RF03 evidence:** PR #18 is merged, but its description still lists unverified Node/Chrome gates; obtain current checks and rerun baseline before any RF04 implementation claim.
- **Navigation:** the RF register and handbook had stale RF02/RF03 delivery labels on this source revision; correct those alongside this plan. The existing RF04 handoff referred to obsolete `dmchurch`; correct the branch reference but leave preparation/implementation unauthorized.

**Rollback:** revert only the eventual RF04 code/contract commits; preserve ordinary/challenge saves, RF02 import journal and prior backups. No new keys or one-way migration should be added under RF04.

**Planning evidence:** source inspection of `main` at `1815ad7`; Orcha published `main` at `b8bf6bf07073823d108fd356c48916ea0cafd615`. No local repository command, Chrome run, Node suite, XML validation, GitHub Actions pass or owner milestone approval is asserted by this document.
