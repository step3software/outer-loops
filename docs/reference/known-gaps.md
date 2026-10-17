# Known gaps and validation risks

This is a documentation baseline and technical risk inventory, not a claim that each issue is a confirmed bug. Promote items into tracked issues/ADRs as evidence accumulates.

| Area | Verified baseline / uncertainty | Consequence | Suggested mitigation |
| --- | --- | --- | --- |
| Gameplay tests | No established automated game/integration test suite in the source tree | Syntax checks cannot verify economics, ticks or saves | Add deterministic unit/browser fixtures before large mechanics refactors |
| Save compatibility | `doLoad()` carries legacy branches; no committed old-save fixture set was found | New persistent fields may break previous players | Build sanitized synthetic saves with explicit version/migration expectations |
| Predictor parity | Worker and main game share globals and snapshot graph; no automated parity harness was found | Background predictions may diverge silently | Compare real and forecasted short queues and add repeatable parity cases |
| Script architecture | Classic scripts depend on global evaluation order | Moving/deleting a script can break bootstrap or worker only | Preserve ordering; migrate only under an ADR and browser tests |
| Action/catalog maintenance | Executable actions are in a large `actionList.js`; XML editor holds a partial alternate model | Docs/editor drift from live behavior | Maintain action catalog automatically and identify one source of truth |
| Localization | English XML is authoritative; partial French XML exists but is disabled | Missing keys, malformed markup, untranslated UI | XML validation and manual rendering check |
| External services | Google OAuth/Drive and analytics scripts load externally | Auth and network paths vary by test environment | Test core offline, cloud only with a dedicated authorized test account |
| Browser storage | Player progress lives in localStorage with legacy format handling | Tests can overwrite real saves | Disposable profiles, exported backups and no real saves in Git |
| UI coverage | Responsive/themes/keyboard are manually exercised | Visual regressions not caught statically | Add focused screenshot/interaction automation when scope justifies |
| Rights | No recognized license in this fork and immediate upstream lineage | Commercial distribution rights uncertain | Obtain rights review before external/commercial redistribution |

## Explicit non-goals of the initial documentation PR

No rebalancing, no changes to runtime behavior, no migration of gameplay into XML, no new backend/framework, no conversion to TypeScript modules, no cloud integration changes, no release pipeline redesign and no declaration of licensing rights.

The added lightweight checks are intended to establish a reliable **floor**, not certification of production readiness.
