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

export function loadGameModel() {
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
    sandbox.self = sandbox;
    vm.createContext(sandbox);
    for (const name of gameScripts) {
        const code = readFileSync(join(root, name), 'utf8');
        vm.runInContext(code, sandbox, {filename: name, timeout: 10_000});
    }
    vm.runInContext('loadDefaults()', sandbox, {timeout: 20_000});
    return {sandbox, evaluate: (source) => vm.runInContext(source, sandbox, {timeout: 10_000})};
}
