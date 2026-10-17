// Node-only inspection harness. Mirrors the predictor worker's shared-source
// evaluation order; it does NOT replace browser integration testing.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const gameScripts = [
    'data.js', 'localization.js', 'helpers.js', 'actionList.js',
    'driver.js', 'stats.js', 'actions.js', 'town.js', 'prestige.js', 'saving.js',
];

export function loadGameModel({ withViewStubs = false } = {}) {
    // A worker has self but no window/document/DOM. This is intentionally
    // closer to predictor-worker.js than index.html. It tests core model only.
    const sandbox = {
        console,
        structuredClone,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        performance,
    };
    if (withViewStubs) {
        // Minimal test-only UI facade: exercise action/queue state transitions,
        // not DOM rendering. The game still runs the original core logic.
        sandbox.View = class {
            requestUpdate() {}
            update() {}
            adjustExpMult() {}
            updateNextActions() {}
            updateLockedHidden() {}
        };
        sandbox.ActionLog = class {
            addSkillLevel() {}
            addBuff() {}
            addSoulstones() {}
            addActionStory() {}
            addGlobalStory() {}
        };
        sandbox.GoogleCloud = class {};
        sandbox.document = { title: 'Idle Loops', getElementById: () => null };
    }
    sandbox.self = sandbox;
    vm.createContext(sandbox);
    for (const name of gameScripts) {
        const code = readFileSync(join(root, name), 'utf8');
        vm.runInContext(code, sandbox, {filename: name, timeout: 10_000});
    }
    vm.runInContext('loadDefaults()', sandbox, {timeout: 20_000});
    return {sandbox, evaluate: (source) => vm.runInContext(source, sandbox, {timeout: 10_000})};
}
