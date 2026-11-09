# RF02–RF04 correction and verification evidence

**Delivery:** RF02 #16, RF03 #18 and the owner-authorized recovery correction
[#24](https://github.com/step3software/outer-loops/pull/24) are merged. #24 passed a
clean bounded review and all 19 fresh local checks at its exact head before merge.
Main `baaa427ebd49e5fa05336a8498796799950453d3` has the identical tested tree. PR #23 incorporated that main commit
and passed all 18 baseline checks at `19169372b46d5ed0bf543253052ddb277d756b55`; timing/recovery
blockers are resolved. The additional calibration command matched all 12 cases
but failed Windows cleanup on both attempts. The full 19-command run is not green.
RF04 #21 remains a separate unmerged draft with its earlier
20-check result. Verification/merge do not accept milestones or deploy the game.

**Current run:** [Review, merge and post-merge verification](../../.orcha/evidence/2026-11-09-pr24-merge-pr23-verification.json)
records all 27 reviewed PR paths, standards mapping, exact revisions and log hashes.
The records below retain the earlier correction-run provenance.

## Original correction runs — retained evidence

| Candidate | Parent | Tested source commit | Executed checks |
| --- | --- | --- | --- |
| main correction | `1815ad7b52e9b976e92f11b845309bd9e0d80724` | `2499810dc324b882b8f013f91290a8d4eb48372b` | 19 passed |
| existing RF04 PR #21 correction | `82605f4ccf12678ab485d8fdc4bad81ae7495c9a` | `7b6b17c0855028d2c59838f08b0582f33f1e7fde` | 20 passed |

The [machine-readable run record](../../.orcha/evidence/2026-11-09-rf02-rf04-fix.json) includes command
results, log digests, candidate file hashes and the current Orcha main revision
`b8bf6bf07073823d108fd356c48916ea0cafd615` with verified document hashes. Later evidence-only commits do not change
these tested runtime sources. The [original failing observation](https://github.com/step3software/outer-loops/blob/fa9cb46fd3fd393d1e2b817d9e17744489c772db/.orcha/evidence/2026-11-09-rf02-rf04-verification.json)
is retained as historical evidence.

## Failure and bounded correction

A saved numeric `options.updateRate` was rejected after reload restored the live
preference as a string: the import contract incorrectly derived types from live
values. The new regression failed with `string !== number` before correction.
The contract now uses the existing option categories and recognizes only the
known numeric-text legacy update rate. Pure normalization converts a clone;
recovery still journals and writes the original raw JSON bytes. Malformed text,
wrong types, unknown fields, quota failure and exact rollback remain checked.

The remaining failures were verification issues: profiler errors masked original
failures/diagnostics; setup consumed tiny execution budgets; Windows process
sampling and Chrome discovery used unsuitable probes; potion fixtures assumed
progress or mana they did not have; generated references/fingerprints were stale
or sensitive to checkout line endings. These were corrected at their owning
layers. The parent time/RSS watchdog and VM guards remain active. Full equivalence
scenarios and their assertions are unchanged and completed with a longer caller
deadline. Regenerated formulas and numerical timing estimates are unchanged.

## Executed coverage and acceptance limits

Both candidates passed base model/action tests, RF01 model/challenges, RF02
preflight/transactions, RF03 model, source identity, balance contracts/equivalence/
supervisor/potion/campaign estimates, generated timing/mechanics, static and XML
checks, the full Chrome smoke suite and real-browser balance calibration. RF04
also passed its model suite. Native browser tests include real predictor Workers,
challenge modes 1–3, prestige, and byte-exact recovery of both slots after clear;
they use disposable profiles and synthetic saves.

RF02 A5/P19/P21 and RF03/RF04's inherited recovery/regression blockers are resolved
**on merged main and the checked #23 candidate**, and in the separate RF04 candidate. All original A1–A8 criteria and owner decisions remain.
Authentic historical saves, every buff/guild/predictor permutation, complete earned
campaigns, official RW00 baselines and live cloud/deployment remain unverified.
The known R15 floor discrepancy is preserved. The original correction runs exited
successfully after using full Windows profile paths. The post-merge reruns exposed
a remaining cleanup failure, recorded below.

## Review, publication and rollback

The owner explicitly authorized reviewing and merging #24 if it passed; that merge
is verified. PR #23 remains draft and unmerged for the updated milestone records.
RF04 #21 and its #19 → #20 → #21 stack are unchanged. No other merge, lifecycle
acceptance, deployment or service activation is implied. Revert the correction
commits to roll back code while retaining all RF02 backup and journal data.

The first post-merge browser attempts hit Windows temporary-profile cleanup errors:
smoke returned success with a warning; calibration matched all 12 comparisons but
returned failure during folder removal. Those attempts are retained. Both unchanged
browser suites were rerun with disposable profiles in an owned ignored writable
project folder. The final calibration attempt still failed during cleanup, so it
remains a failed command despite the passing comparisons. No source, assertion,
confirmation choice or execution limit was changed.

The older failure and correction JSON records are preserved unchanged as historical
observations. The new run record owns the current merged/rerun results. No hosted
GitHub CI pass is claimed from local checks; authentic saves, exhaustive predictor
permutations, earned campaigns, official RW00 baselines and R15 remain outside the
verified scope.
