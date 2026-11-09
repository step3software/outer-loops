# RF02–RF04 correction and verification evidence

**Delivery:** RF02 #16 and RF03 #18 are merged. This bounded correction and RF04
PR #21 remain unmerged candidates. Passing checks do not accept a milestone,
advance Orcha's legacy `proposed` stage, merge code or establish deployment.

## Exact tested sources

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
**in these candidates**. All original A1–A8 criteria and owner decisions remain.
Authentic historical saves, every buff/guild/predictor permutation, complete earned
campaigns, official RW00 baselines and live cloud/deployment remain unverified.
The known R15 floor discrepancy is preserved. The earlier Windows profile cleanup
failure was corrected by resolving the full profile path; both final browser
harnesses exited successfully.

## Review and rollback

Keep all PRs draft and unmerged for owner review; preserve RF04's actual #19 → #20
→ #21 stack. The milestone-record PR owns the consolidated delivery ledger.
Revert correction commits to roll back code; retain all RF02 backup and recovery
journal data. No production saves or accounts were used.
