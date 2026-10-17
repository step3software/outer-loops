# XML content editor and schema

## Two different representations of actions

**The live game executes `Action.*` definitions in `actionList.js`.** The `data/` XML files belong to an experimental authoring/editor path and are not a replacement for the current executable action registry.

- `editor.html` — stand-alone editor entry page with its own script load order
- `editor.js` — editor models, UI bindings and `startEditor()`
- `schema.js` — parser/semantic representation of a Relax NG schema
- `data/actionList.xml` — XML action/adjustment definitions loaded by the editor
- `data/refs.xml` — auxiliary reference data
- `data/schema/actionList.rng` — Relax NG schema used by the editor
- `uicomponents.js` — reusable DOM/custom elements for editor controls

`startEditor()` initializes defaults, waits for localization, then invokes `editor.init().load("data/actionList.xml")`. `index.html` does **not** load `schema.js` or `editor.js` and does not consume `data/actionList.xml` to construct live actions.

## Development boundaries

- For a player-facing action change: edit `actionList.js` and the relevant runtime systems, then update `lang/en-EN/game.xml`, assets, save compatibility and documentation. Do **not** edit only `data/actionList.xml` and assume the behavior changes.
- For an editor/schema change: adjust the editor model, XML and Relax NG schema together. Validate editor boot separately at `/editor.html`.
- Avoid adding an XML-to-JS generation pipeline without an explicitly scoped architectural decision and migration/testing plan. The existing editor XML is not a complete source for all the game's executable definitions.
- Treat editor controls as experimental until tested. Do not promise export or round-trip behavior without verifying the specific controls in a browser.

## Validation

Serve over HTTP (not `file://`), open `editor.html`, confirm schema/XML load and page render without console errors, and exercise the affected input. Run `python scripts/check-xml.py` for well-formedness; this does not establish Relax NG semantic correctness. For changes that also affect gameplay, run the normal [regression matrix](development/validation.md).
