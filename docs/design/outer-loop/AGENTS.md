# Real World design-document instructions

Inherits [root AGENTS.md](../../../AGENTS.md) and [documentation AGENTS.md](../../AGENTS.md).

- This directory is **product/technical design**, not implemented mechanics. Label rules **Approved**, **Recommended / provisional**, **Open** or **Existing as-coded**. An accepted product direction is not an authorized source edit.
- Treat [decisions.md](decisions.md) as the decision record and [README.md](README.md) as the navigator. Update them when the user chooses a new behavior; avoid stale duplicate descriptions across files.
- Preserve the authoritative existing `RestoreTime` story, action definitions and nine-zone model. The Real World concept is not the jungle `OpenPortal` travel action or `townNum=9`.
- Do **not** resurrect dmchurch's Prestige Perks shop or old Challenges menu alongside Real World. Whether individual buffs, perks, challenges or old earned balances are *ported* remains an explicit open migration decision.
- A newly started timeline after first completion is intended to be **~10× faster without requiring a purchase**; distinguish wall-clock throughput from in-game mana/skill rules, time-dependent gating, offline bonuses and predictor accuracy. Never declare a stacking formula approved before it is tested and decided.
- First meeting: one alternate self, a meaningful nexus choice, and no automatic deletion of the just-completed timeline. Roster growth, class/role specialties and background work are future-facing proposals.
- Any asset/art recommendations are references or intentions only. Do not generate pixel art or change visuals without an explicit image/artwork implementation request.
- All save and outer-state changes must coordinate with [RF01](../../refactoring/RF01-regression-coverage.md), [RF02](../../refactoring/RF02-persistence-safety.md), and [persistence audit](../../audit/persistence-contract.md). The refactoring milestone specs themselves remain approved **as plans** and are not implicitly reauthorized or revised here.
