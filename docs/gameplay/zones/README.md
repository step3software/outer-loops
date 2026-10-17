# Zone-by-zone gameplay reference

Nine zero-indexed towns are defined in `actionList.js`. These notes describe existing progression, not the fastest route. Consult the [full mechanics reference](../../reference/action-mechanics.generated.md), [travel map](../../audit/progression.md) and [change recipes](../../development/recipes.md).

| Index | Town | Actions | Guide |
| ---: | --- | ---: | --- |
| 0 | Beginnersville | 25 | [Opening](00-beginnersville.md) |
| 1 | Forest Path | 23 | [Harvest and magic](01-forest-path.md) |
| 2 | Merchanton | 20 | [Commerce and guilds](02-merchanton.md) |
| 3 | Mt. Olympus | 19 | [Souls and judgment](03-mt-olympus.md) |
| 4 | Valhalla | 25 | [Favors and citizenship](04-valhalla.md) |
| 5 | Startington | 13 | [Dark build](05-startington.md) |
| 6 | Jungle Path | 11 | [Combat and escape](06-jungle-path.md) |
| 7 | Commerceville | 15 | [Survey and investment](07-commerceville.md) |
| 8 | Valley of Olympus | 6 | [Tower and completion](08-valley-of-olympus.md) |

Zone IDs, array lengths and action `varName` participate in save compatibility. Adding a zone requires coordinated changes across surveys, travel, initialization, UI, saves and the predictor.
