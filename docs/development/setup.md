# Local development setup

## Prerequisites

- A current desktop browser with developer tools; Chromium- or Firefox-based browsers are suitable.
- Git and a static HTTP server; Python's built-in server is sufficient.
- Node.js **22+** to run the repository's static checks. `npm` installs no runtime libraries for the game; dev packages in `package.json` are type definitions.

## Start the game

```sh
git clone https://github.com/step3software/outer-loops.git
cd outer-loops
python -m http.server 8000
```

Open `http://localhost:8000/` for the game, or `http://localhost:8000/editor.html` for the experimental editor. The server must run from the repository root: AJAX-loaded `lang/en-EN/game.xml`, optional worker scripts and editor/schema XML need HTTP. Launching `index.html` directly with `file://` may fail.

You can use VS Code's Live Server instead. The repository default branch is `dmchurch`; create a feature branch before editing.

## Static checks

```sh
npm run check
npm run test:model
npm run test:action
npm run check:mechanics
python scripts/check-xml.py
npm run test:browser
```

`npm run check` uses Node's built-in facilities to check first-party JavaScript syntax, relative documentation links, the action catalog and HTML script paths; no `npm install` is required to run it. The separate Python check parses checked-in XML and Relax NG files for well-formedness. The first static checks do not start the browser game; `npm run test:browser` requires an installed Chrome/Chromium browser and uses a disposable profile for a real startup/Wander/save-reload smoke.

For editor type hints, `npm ci` installs the type-only developer dependencies. `jsconfig.json` / `types.d.ts` define existing JavaScript/JSDoc typing boundaries; there is no enforced TypeScript compile step today.

## Safe browser workflow

1. Use a separate browser profile/origin for experimental play, or export a backup before touching an existing save. The default save key is `idleLoops1` and challenges have a separate key.
2. Open Developer Tools → Console and Network before changing game mechanics. Look for script failures, missing XML, failed Google API requests and worker errors.
3. Run a short queue; pause, resume and allow a loop restart. Observe unlocked actions and resource totals.
4. Save/reload, export/import into a *disposable* test profile, and check both predictor settings as applicable.
5. When modifying UI, check both narrow and wide viewports plus keyboard focus and at least two contrasting themes.

Do not enable cheat functions or reset saves in a production player profile.

## Repository structure

See [code map](../reference/code-map.md) for every first-party source file, [architecture](../architecture.md) for initialization ordering, and [validation](validation.md) for the current regression checklist.
