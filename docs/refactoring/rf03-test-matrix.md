# RF03 prospective validation matrix — gameplay rules and resources

**Status:** Planned tests only; none executed by the implementation-preparation request.  
**Charter:** [RF03 A1–A8](RF03-gameplay-rules-and-resources.md) · **Implementation readiness:** [source-anchored contract](rf03-readiness.md) · **Existing RF01 matrix:** [F01–F15](validation-matrix.md).  
**Required dependency:** RF02's P01–P22 recovery and migration tests are green on the actual implementation base.

Tests use only synthetic states, fresh disposable browser profiles, controlled clock/RNG, worker-like Node VM, and actual foreground/background browser predictor. Never commit genuine player saves or call live Google OAuth.

| ID | Scenario | Expected result | Primary acceptance | Surface |
| --- | --- | --- | --- | --- |
| G01 | Call `getBuffCap` in Node VM without `document` or `HTMLInputElement` for Ritual and each imbuement cap | Authoritative defaults/edits return; no DOM lookup or exception | A1, A6 | New RF03 model test |
| G02 | Evaluate Dark Ritual, Imbue Mind, Imbue Body and every rule caller of `getBuffCap` in DOM-less simulation | Same calculation and eligibility as equivalent browser state | A1, A7 | Model + browser/worker |
| G03 | Mutate a cap through the state setter before UI creation | State and calculation update; snapshot/readback agrees | A1, A5, A6 | Model |
| G04 | Edit valid 0, midrange and hard-cap values; submit invalid blank, NaN, non-integer, negative, overflow, unknown buff | Valid edits commit; rejected edits do not change state and restore last-good UI representation | A4, A6 | Model + Chrome |
| G05 | Browser cap edit then `doSave`/reload/export/import using current and RF02 legacy synthetic saves | Existing `buffCaps` names and values retained; missing fields safely default; no new required fields | A5, A6 | Chrome + RF02 fixtures |
| G06 | Snapshot and restore caps on foreground predictor then on real worker | Matching caps/cost/eligibility before and after import/reset, without worker DOM | A1, A5 | Chrome + real Worker |
| G07 | Fresh initialization, restart and prestige/challenge load with edited cap | Correct persistence/reset lifetime, no default-ID mismatch or cross-slot change | A5, A7 | Model + Chrome |
| G08 | Call Escape `canStart` 1× and 10× below 60 without execution | Returns true; `escapeStarted` and all gameplay state unchanged | A2, A3 | Model |
| G09 | Call Escape `canStart` at 60 and 60.01 before activation | Returns false and remains read-only | A2, A3 | Model |
| G10 | Queue/inspect Escape at 59.99, then pause, abandon or reach 60 without positive spending | No activation; at 60 first actual spending remains ineligible and spends zero mana | A2, A3 | Model + queue |
| G11 | First Escape tick consumes strictly positive mana at 59.99; subsequent time exceeds 60 | Flag commits exactly once; action continues under sticky eligibility | A3 | Real engine model + Chrome |
| G12 | Probe/zero-mana call, partial interrupted step, repeat-last and failed/aborted queue | No accidental activation, double commit or mana/story changes; existing queue skip behavior retained | A2, A3, A7 | Model + Chrome |
| G13 | Restart, keep-current-list, worker prediction and second run | Flag resets; prediction does not mutate live `escapeStarted`; run eligibility restores threshold | A2, A3, A5 | Model + Worker |
| G14 | For each of 18 numeric keys, apply 0, positive, negative and fractional finite deltas | Exact valid arithmetic and unchanged notifications; valid negative balances preserved | A4, A7 | Model |
| G15 | For each of nine boolean keys, set true and false, repeatedly and after reset | Exact boolean flags and expected updates, no arithmetic or numeric coercion | A4 | Model |
| G16 | Execute the direct-write actions: Wizard College, Fall From Grace and Assassin heart delivery | Exact earlier values/story/skill changes and correct resource UI updates | A4, A7 | Model |
| G17 | Try NaN, Infinity, -Infinity, undefined, null, strings, boolean-to-number, number-to-flag and unknown key | Each operation fails before mutation or UI update; caller-visible, testable error | A4 | Model |
| G18 | Attempt valid finite delta that overflows final numeric result, or mutate poisoned preexisting resource | No nonfinite result, no partial state/notification and no save poisoning | A4, A5 | Model |
| G19 | `resetResource` and `resetResources` followed by `Data` snapshot/export/import, loop restart and default glasses grant | Typed defaults restored; registered object graph sees live resources, not stale replaced object | A4, A5 | Model + Worker |
| G20 | Run queued costs/rewards, limited items, multipart dungeon/trial, prestige and all three challenges | Existing resource deltas, metadata, queue effects and serialized values unchanged | A4, A7 | RF01 suites + Chrome |
| G21 | Compare foreground and real worker predictor for Ritual/Imbue/Escape/resource examples | Equal source state and field-level prediction outcomes; report any unrelated known R15 separately | A1, A2, A7 | Chrome + real Worker |
| G22 | Import/restore current and legacy synthetic saves through RF02, including intentionally rejected candidate | Existing slot bytes/recovery policy intact; no required new field; caps safely applied | A5, A7 | RF02 + Chrome |
| G23 | Compare default game, pause/restart, normal/challenge/prestige, UI cap input and saved state through browser flows | No unexpected UI, queue, story or balance drift; record only executed combinations | A5–A7 | Chrome |
| G24 | Run static, model, RF01, RF02, RF03, mechanics, XML and Chrome CI gates | All applicable gates green; evidence ledger maps A1–A8, files, command results and untested limits | A7, A8 | CI + evidence ledger |

## Before/after characterization strategy

- Capture old `Escape.canStart` side-effect behavior and the DOM-less `getBuffCap` failure as *pre-fix evidence*. The merged RF01 test currently expects sticky activation from a mere query; replace that assertion only when the new positive-spend test is demonstrably green. Never retain an expected old bug as the new RF03 success condition.
- Compare exact state deltas for all valid resource paths. Numeric tests distinguish finite **input** from finite **result** and cover boolean-class mismatches, not only literal NaN.
- For each predicate, repeat calls against a stable serialized/snapshotted state, comparing resources, `escapeStarted`, quest/story flags, town and level counters, and action queue state; distinguish deliberate queue movement by `getNextValidAction` from changes caused by its eligibility predicates.
- Test the **real** Worker in Chrome, not solely a Node VM. The established RF01 Wander worker test does not establish Ritual or Imbue parity.
- Run RF01 F01–F07, F10–F12, plus RF02 P01–P22 where applicable. Preserve the known R15 Gods Trial disparity as a separately tracked finding rather than changing it to make RF03 pass.

## Result reporting

For each G ID record `not run` / `pass` / `fail` / `blocked`, the synthetic fixture, source revision, runner/browser version, exact observed result, and linked evidence. Distinguish new intentional safety behavior from preserved valid gameplay. Do not claim broad historical-save or full campaign coverage without actual execution.

**No tests were executed or added during this documentation-only preparation.**
