# Outer Loops

A community-derived fork of **Idle Loops**, the browser incremental game about planning actions across repeating time loops.

This repository is `step3software/outer-loops`, forked from [dmchurch/omsi-loops](https://github.com/dmchurch/omsi-loops). The game retains the Idle Loops zones and action systems and adds dmchurch-era features such as prestige, an action predictor, an action log, themes, and content-editing experiments. See [provenance and rights](docs/reference/upstream-and-rights.md).

## Run locally

The game is a static browser application; no backend or JavaScript build step is required.

1. Clone the repository and enter its directory.
2. Start a local HTTP server from the repository root (required for loading XML and worker files), for example:
   ```sh
   python -m http.server 8000
   ```
3. Open [http://localhost:8000/](http://localhost:8000/) for the game or [http://localhost:8000/editor.html](http://localhost:8000/editor.html) for the experimental content editor.
4. Test using a separate browser profile or export your existing save before changing the game. Browser `localStorage` is used for normal saves.

`npm` is **not** needed to play. With Node.js 22 or newer installed, run static development checks:

```sh
npm run check
```

For XML well-formedness checks, also run `python scripts/check-xml.py`. These checks do not replace browser gameplay testing.

## Development documentation

- [Agent entry point](AGENTS.md)
- [Documentation index](docs/README.md)
- [Architecture and runtime](docs/architecture.md)
- [Game mechanics and zones](docs/gameplay.md)
- [Save format and compatibility](docs/state-and-saving.md)
- [Development setup](docs/development/setup.md)
- [Validation and smoke-testing](docs/development/validation.md)
- [AI-assisted change workflow](docs/development/ai-workflow.md)
- [Comprehensive technical/gameplay audit](docs/audit/README.md)
- [All 157 executable actions: formulas and gates](docs/reference/action-mechanics.generated.md)
- [Per-zone gameplay guides](docs/gameplay/zones/README.md)

## Layout

The primary game entry is `index.html`. Executable actions are in `actionList.js`, the tick and loop engine in `driver.js` / `actions.js`, persistent state in `saving.js`, UI code in `views/`, localization in `lang/`, and the optional predictor in `predictor.js` / `predictor-worker.js`. The stand-alone editor (`editor.html`) uses `data/` XML and schema assets; its XML is not the game's authoritative action implementation.

## Important rights note

GitHub currently reports no license for this repository or the relevant parent repositories. Public visibility and fork availability do **not** automatically grant broad redistribution or commercial licensing rights. Preserve upstream credits and consult [upstream and rights](docs/reference/upstream-and-rights.md) before publishing or relicensing.
