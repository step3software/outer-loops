# UI, input and localization

## Rendering architecture

`index.html` provides structural markup and loads CSS (`stylesheet.css`, `themes.css`, `predictor.css`, `statsgraph.css`) and scripts. `views/main.view.js` defines the large `View` class that constructs action/stat panels and schedules updates. `views/views.js` exposes `Views.registerView(...)` and `Views.draw()` for additional HTML fragments.

`views/menu.view.js`, `views/buffs.view.js`, `views/talenttree.view.js`, `views/timecontrols.view.js` and `views/trackedresources.view.js` register page pieces. `uicomponents.js` contains low-level DOM rendering helpers and custom elements (such as reorderable-list components). `hotkeys.js` handles keyboard controls; `actionLog.js` and `statsgraph.js` provide related presentation.

**Do not assume these are Vue/React components**: despite legacy "vue" comments, they are plain JavaScript functions and objects.

## Redraw and interaction contract

- Use `view.requestUpdate("methodName", payload)` when a system already exposes an update path. Direct DOM mutation can leave queued updates, hover state or predictor output inconsistent.
- Preserve element ids and `onchange` / `onclick` hooks used directly in HTML, menu strings and the `View` class.
- Consider action queue drag/drop, amount controls, disabled entries, tooltips, focused elements and narrow-width navigation.
- UI is themed with CSS variables, `options.theme` / theme variants and `latestTheme` in `localStorage`. Inspect `themes.css` and `View.changeTheme` before adding hard-coded colors.

## Localized text

`localization.js` defines `Localization`, `Localization.ready`, `_txt` and `_txtsObj`. At startup, it requests English fallback and the active `game.xml`; `index.html` only starts the game after localization resolves.

The canonical English text is `lang/en-EN/game.xml`. DOM elements may use `class="localized" data-lockey="..."`; action labels/tooltips/stories are looked up via `getXMLName(...)` and `Action.xmlNameFor(...)`, with special handling for surveys and assassinations. The XML file also contains changelog, menu, story and description content.

`lang/fr-FR/game.xml` exists but the entry in `Localization.supportedLang` is commented out, so French is not currently an advertised supported language. Do not claim translation completeness.

## Adding/changing visible text

1. Identify whether the string is a static HTML node, dynamically generated menu, action tooltip, story, or application alert.
2. Reuse existing XML paths or add the appropriate nested `lang/en-EN/game.xml` entry. Prefer localized keys over new user-visible hardcoded English.
3. Confirm the lookup path and the real `Action.name`/`varName` mapping; do not rename persisted action identifiers just to alter copy.
4. Verify the string after loading over HTTP; check XML parsing and any embedded HTML/CDATA.
5. Check themes, keyboard focus, responsive layout and any worker path that may reference labels.

## External dependencies

`index.html` includes analytics and Google identity/API scripts; the core game can be developed without logging into Google. Failure of an external script should not be "fixed" by introducing secrets or requiring developer access to a production cloud account. Use a local browser and consult [debugging](development/troubleshooting.md).
