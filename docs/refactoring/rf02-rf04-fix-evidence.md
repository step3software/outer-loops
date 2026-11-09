# RF02–RF04 correction and verification evidence

**Current result:** The Windows profile-cleanup failure is resolved by the shared
test teardown correction in [PR #23](https://github.com/step3software/outer-loops/pull/23).
All **20 selected checks pass** at `68e012611ba425045c1db9a881c86b10120846f0`, including the formerly failing
12-case calibration and strict cleanup, using normal Windows temporary storage.

RF02 #16, RF03 #18 and recovery correction #24 are merged. PR #23 delivers this
cleanup fix and the milestone records under the owner's explicit conditional
merge request. The provider page owns its merge outcome. Verification does not
accept an Orcha stage, complete a milestone, deploy the game or authorize later work.

## Current source and proof

The [cleanup run record](../../.orcha/evidence/2026-11-09-windows-cleanup-verification.json) records the exact base/head, all 20
commands and log digests, current Orcha main `b8bf6bf07073823d108fd356c48916ea0cafd615`
and governing project document hashes, changed-path review and preserved history.

Chrome is asked to close through its existing page connection. Pending CDP calls
and timers are disposed, the owned process exit is awaited, and only the
registered canonical temporary profile is removed asynchronously. Force
termination is a bounded fallback. Cleanup failures fail the command, preserve
the original test failure and still close the local server. No old functional
assertion, watchdog, VM guard, confirmation or gameplay callback was weakened.

The new real-browser regression asserts confirmed graceful exit, complete profile
removal, repeated cleanup, forced fallback, startup cleanup and refusal to delete
an unowned directory. It is included in `npm run test:browser`. Full smoke retains
save/reload, legacy imports, byte-exact recovery of both slots, challenges,
prestige and production Worker checks. The original 12 calibration comparisons
are unchanged; both suites now complete teardown without a warning or host assist.

## Historical observations — retained unchanged

| Observation | Evidence |
| --- | --- |
| Original RF02 recovery rejection and broader failed checks | [Failure record](../../.orcha/evidence/2026-11-09-rf02-rf04-verification.json) |
| Recovery correction and original 19/20-check candidate runs | [Correction record](../../.orcha/evidence/2026-11-09-rf02-rf04-fix.json) |
| #24 review/merge, #23's 18 baseline passes and Windows calibration-cleanup failures | [Merge/rerun record](../../.orcha/evidence/2026-11-09-pr24-merge-pr23-verification.json) |

These artifacts retain their original outcomes and source pins. The new passing
run supersedes the cleanup blocker for this candidate; it does not rewrite any
old failed command as a pass. Timing regeneration changed only source identity,
with all numerical estimates and gameplay formulas unchanged.

## Scope and remaining limits

All 24 original RF02–RF04 A1–A8 criterion lines and existing owner selections are
preserved. Orcha remains in legacy authority with unchanged approval stages and
accepted artifacts. RF04 #21 is unchanged at
`a6fc99653961c59b5be6e0aee2e9f673ec031a86`, with its prior candidate evidence and
#19 → #20 → #21 stack; this run does not reverify or merge that implementation.

Authentic player saves, exhaustive UI/predictor/buff permutations, complete earned
campaigns, official RW00 baselines and live cloud/deployment remain unverified.
The known R15 discrepancy is unchanged. Local results do not imply hosted CI
passed. Roll back the cleanup change by reverting its commit while retaining all
RF02 save backups and recovery journals.
