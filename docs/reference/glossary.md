# Glossary

| Term | Meaning in this codebase |
| --- | --- |
| **Action definition** | A registered executable `Action.*` object defined in `actionList.js` |
| **Action name** | Human-facing name or queue name; may differ from `varName` |
| **`varName`** | Stable internal action variable used in town progress and saves |
| **Action type** | `normal`, `progress`, `limited` or `multipart`; independent of constructor subclass |
| **Queue: next/current** | `Actions.next` is planned next-loop sequence; `Actions.current` is the executing sequence |
| **`loopsType`** | Interpretation of queue `loops` (actions, maxMana, maxEffort, knownGood, unchecked) |
| **Mana/tick** | Runtime budget consumed by actions; game time is converted from wall-clock time in `driver.js` |
| **Loop restart** | End of one planned run; temporary state resets, durable progression remains |
| **Town** | Code term for a zone (one `Town` instance) |
| **Survey** | Per-zone exploration/progress variable; affects discovery and some availability |
| **Limited action** | Action backed by total/checked/good/temporary-good counts and reward pool |
| **Multipart action** | Action with segments, segment costs and counters; includes guilds, dungeons and trials |
| **Talent vs stat level** | Distinct layers of long-term/loop experience handled in `stats.js` |
| **Skill** | Named progression stat with bonus formulas and action training |
| **Buff** | Special earned modifier with cap and persistence semantics |
| **Prestige** | Meta-progression reset with purchased permanent modifiers; distinct from loop restart |
| **Challenge** | Alternate gameplay mode/save with live overrides defined in `challenges.js` |
| **Story flag / variable** | Persistent narrative boolean or numeric state; conditions link to action stories |
| **Data snapshot** | `Data`-managed copy/overlay of registered objects for simulation; not a save export |
| **Predictor** | `Koviko` simulation of planned queue and future outcomes, optionally worker-backed |
| **Localization key** | Lookup path in `lang/en-EN/game.xml` read with `_txt` / `Localization` |
| **Content editor** | Experimental `editor.html` and `data/*` XML/schema path, not the executable game data |
| **Save string** | `ILSV01` + LZString Base64 compressed JSON export |
| **Upstream** | Prior fork or source repository in the Idle Loops lineage; does not imply a license |
