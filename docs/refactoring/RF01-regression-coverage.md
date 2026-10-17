# RF01 — Expand regression coverage

- **Status:** **Implementation in review**, user-authorized. [PR #4](https://github.com/step3software/outer-loops/pull/4) is open and unmerged; see [RF01 evidence and coverage](rf01-evidence.md) for executed tests and remaining gaps.
- **Priority:** First / foundational
- **Hard dependencies:** Existing AI-development foundation and baseline tests; no earlier RF milestone
- **Enables:** RF02–RF06, with mandatory targeted characterization tests for each
- **Primary implementation handoff:** [RF01](handoffs/RF01.md)
- **Cross-milestone acceptance:** [validation matrix](validation-matrix.md)

## Objective

Replace the current "source review plus opening Wander smoke" level of confidence with **repeatable behavior-preserving characterization tests** for the game's important progression, state-lifetime and execution paths. RF01 does **not** refactor gameplay. It builds the safety net needed to assess later milestones independently.

The [audit coverage ledger](../audit/coverage.md) identifies missing migration fixtures, real predictor parity, challenge tests and late-game action regression. The baseline already provides `scripts/load-game-model.mjs`, `scripts/test-game-model.mjs`, `scripts/test-action-execution.mjs`, `scripts/test-browser-smoke.mjs` and the executable-action reference. Expand them rather than discarding useful coverage.

## In scope

1. **Deterministic synthetic fixtures.** Build disposable current-save and carefully reconstructed legacy-save shapes, including older `maxTown`, `storyReqs`, `version75`, former action names, old option structures and alternative challenge slots. No real user saves or sensitive data. Label inferred fixtures as synthetic, not authentic historic player saves.
2. **Action-category characterization.** Exercise one or more representative `normal`, `progress`, `limited`, `multipart`, `DungeonAction` and `TrialAction` actions. Include known-good vs unchecked item discovery, skill/buff effects, segment/floor reward once-only, unavailable-cost skip and stable source identity.
3. **Loop and queue behavior.** Test `Actions.current` versus `Actions.next`, repeat limits, disabled actions, `loopsType` variants, travel order, empty queue, normal restart, pause/restart, fractional mana and temporary versus durable state. Check seeded/substituted clock and RNG rather than assuming actual timings are identical across machines.
4. **Save and challenge baselines.** Record valid `ILSV01` export/import/reload, legacy decode, challenge modes 1–3, both save slots, challenge exit, prestige carry-over and explicit destructive-operation risks. For a currently unsafe import, characterize the defect but do **not** "golden test" unsafe behavior as a permanent requirement.
5. **Predictor parity.** Capture the same initial state/queue and compare actual gameplay against foreground and worker prediction on chosen deterministic fields (spent mana, town progress, resources, story flags, XP, completed segments). Include one late-game terminal-power boundary such as Gods Trial and one DOM-adjacent ritual-cap scenario. Record known differences before any code change.
6. **CI/fixtures/reporting.** Wire repeatable, fast tests into PR validation; document fixture construction, deterministic seeds, time budget, per-mode coverage and outstanding gaps. Keep the existing static/model/Chrome tests.

## Explicitly out of scope

Changing action rewards/unlocks, save serialization format, resource APIs, challenge monkey-patches, predictor algorithms, gameplay DOM dependencies or rendering architecture. A minimal **test-only** injection/adaptor may be proposed where necessary, provided it is behavior-neutral; if changing runtime code is unavoidable, document and review the seam separately before adopting it.

## Source and audit touchpoints

`actionList.js`; `actions.js` (execution, queue, `loopsType`); `driver.js` (time, pause, resources, restart); `town.js`; `stats.js`; `saving.js` (`doLoad`, `doSave`, `processSave`); `challenges.js`; `prestige.js`; `predictor.js`, `predictor-worker.js` and `data.js`; browser startup in `index.html`. See [findings R01–R04, R07, R08 and R15](../audit/findings.md).

## Acceptance criteria — RF01 can be called done only when

- **A1:** Fixtures are synthetic, deterministic, version/intent-labeled and independently reproducible from instructions; no real save data or secrets are committed.
- **A2:** CI asserts concrete state changes for each of the four action types plus at least one dungeon and one trial; includes a known-good/unchecked limited-action case, not only the opening Wander.
- **A3:** Explicit tests establish what survives a normal restart versus challenge entry/exit and prestige. Queue/order and fallback behavior are asserted.
- **A4:** Current-save roundtrip, at least two distinct synthetic legacy field/alias combinations, and invalid/truncated imports are characterized; unsafe import behavior is flagged, not silently accepted.
- **A5:** Challenge modes 1, 2 and 3 are characterized against the original implementation, including normal-game restoration via the current reload transition and separate save keys.
- **A6:** Foreground and worker predictor comparisons have an explicit per-field parity contract with stated float tolerance, seeded sources of variability and documented exceptions. At least one representative queue passes in both modes; any known mismatch is captured as a **failing or quarantined explicitly labeled** scenario with a linked issue, not hidden.
- **A7:** CI runs the new tests in addition to all existing validation commands, and a real Chrome test exercises an actual page/queue/save boundary using a disposable profile.
- **A8:** A coverage document maps each scenario to required downstream milestones and marks untested late-game cases. No claims of 100% test or progression coverage unless measured and demonstrated.

## Test plan and evidence

**Commands (RF01 implementation branch):** `npm run check`, `npm run test:model`, `npm run test:action`, **`npm run test:rf01:model`**, **`npm run test:rf01:challenges`**, `npm run check:mechanics`, `python3 scripts/check-xml.py`, `npm run test:browser`. Fixture builder: `scripts/rf01-fixtures.mjs`. The expanded real Chrome smoke contains legacy synthetic imports, original prestige and challenge state, and foreground/Worker prediction. For exactly what passes versus remains untested, see [executed evidence](rf01-evidence.md).

**Required scenarios:** F01–F08, plus initial expectations for F09–F15 where they protect risky code. Include reputation 49/50/51, `Escape` before/after 60 effective seconds, blood/zombies/Dead Trial, limited item knowledge, capital/interest, a 100th Gods Trial reward, current/legacy save decode and three challenge modes. When a late-game fixture cannot be made deterministic, record the blocker rather than deleting the scenario.

## Risks, rollback and handoff gate

Testing can accidentally mutate browser storage, create brittle golden snapshots or mask non-determinism. Use isolated origins, explicit fixture cleanup, stable assertions and controlled time/randomness. Rollback is removal of added test infrastructure, with original game behavior untouched; do not delete or rewrite existing tests merely to satisfy a new harness.

**Exit handoff (RF01 in review):** The [RF01 evidence ledger](rf01-evidence.md) verifies synthetic current/legacy imports, actual invalid-JSON overwrite failure, original challenge slots/prestige reset, and one foreground/Worker predictor parity queue. Historical actual user-save fixtures, broad late-game simulation, full backtracking travel and all fractional/offline timing remain explicitly unverified. RF02 may start only after save/import/migration fixtures (F08–F09 baseline) pass and failure cases can be reproduced. RF03/RF04 require relevant rule/challenge/predictor cases; RF05 needs exact action registration-order snapshots; RF06 needs real UI behavior smoke. Resolve any prerequisite gaps explicitly in the RF01 PR and [handoff](handoffs/RF01.md). Open a separate implementation PR to `dmchurch` when authorized; no automatic merge.
