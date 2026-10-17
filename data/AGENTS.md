# Experimental editor data instructions

Inherits [repository AGENTS.md](../AGENTS.md). Read [content editor](../docs/content-editor.md).

- `data/actionList.xml`, `data/refs.xml` and `data/schema/actionList.rng` support `editor.html` through `schema.js` and `editor.js`.
- These XML files are **not** the authoritative runtime action definitions; game mechanics are implemented by `Action.*` entries in `actionList.js`.
- Treat the editor as experimental. Do not claim that modifying its XML automatically updates the game.
- Keep XML schema, editor UI and referenced values consistent. Run XML validation and verify the editor separately from the game.
