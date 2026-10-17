# Zone 8 — Valley of Olympus

**Six actions.** This is the source-visible completion/prestige sequence.

## Gameplay dependencies

- `Imbue Soul` is a three-segment action. It needs `Imbuement` and `Imbuement2` buffs both at least 500, and fewer than seven `Imbuement3`. Its loop completion resets existing stat talents, soulstones and Mind/Body imbuement while raising `Imbuement3` and the training multiplier.
- `Build Tower` uses **linear** progress and requires a carried stone. Every finish increments source-specific `stonesUsed`, raises progress by 505 XP and consumes the stone. At 5,050 XP per linear level, 100 levels imply **1,000 successful contributions** from four origin zones capped at 250 each.
- `Gods Trial` (Trial #1) can grant one power on completion of its 100-floor series. The source includes a comment that the predictor assumes older completion semantics: inspect before changing progression.
- `Challenge Gods` (Trial #2) uses seven increasingly expensive floors and awards one power per completed floor. Its `canStart()` requires existing power >0 and <8, combining with the first trial into an eight-power path.
- `Restore Time` becomes available when Build Tower reaches level 100, requires ≥8 power and costs 7,777,777 mana. Its `finish()` sets reputation high and calls `completedCurrentGame()`, granting 90 prestige points once per completion cycle.

## Regression boundaries

Do not shorten the tower/soulstone loop, change power floors or prestige reset semantics incidentally. Test source stone caps, linear XP boundary, Imbue Soul carry-over, 100-floor Gods Trial terminal reward, seven-floor Challenge Gods, 8 power condition, one-time 90-point award and reset/reload behavior.
