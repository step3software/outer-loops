# View-layer agent instructions

Inherits [repository AGENTS.md](../AGENTS.md). Read [UI and localization](../docs/ui-and-localization.md).

- The app uses classic script globals, HTML templates and `Views.registerView` / `Views.draw`, plus the `View` class in `views/main.view.js`. It is not React or Vue; the comment spelling "vue" is historical.
- Preserve DOM ids, localization keys, inline handler contracts and script load order in `index.html`.
- Route reactive redraws through `view.requestUpdate` where available; consider batch updates and predictor synchronization rather than rebuilding the DOM in a tick.
- Check narrow viewport layout, keyboard focus, tooltips, themes, and accessibility for visible changes.
- Do not reset saves or alter gameplay rules to fix a purely visual problem.
