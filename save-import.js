// @ts-check
"use strict";

// Pure save import decoding, normalization, and structural validation.
// This classic-script file is also loadable from Node regression tests.
// No browser storage, DOM, current game state, or replay side effects.
var SaveImport = (() => {
    const MAX_ENCODED_CHARS = 4_000_000;
    const MAX_DECODED_CHARS = 16_000_000;
    const MAX_NODES = 400_000;
    const MAX_DEPTH = 80;
    const MAX_ACTIONS = 50_000;
    const MAX_LOADOUTS = 64;

    class SaveImportError extends Error {
        constructor(code, message) {
            super(message);
            this.name = "SaveImportError";
            this.code = code;
        }
    }

    function invalid(code, message) {
        throw new SaveImportError(code, message);
    }

    function record(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    function isFiniteNonnegative(value) {
        return typeof value === "number" && Number.isFinite(value) && value >= 0;
    }

    // All published doSave() keys, legacy option fields and historical aliases.
    // Unknown structured or primitive *top-level* fields are rejected rather
    // than discarded on the next autosave, including future outer-world state.
    const allowedFields = new Set([
        "curLoadout", "dungeons", "trials", "townsUnlocked", "maxTown",
        "completedActions", "stats", "totalTalent", "skills", "buffs",
        "prestigeValues", "goldInvested", "stonesUsed", "version75",
        "hiddenVars", "nextList", "loadouts", "loadoutnames", "options",
        "extraOptions", "storyShowing", "storyMax", "storyReqs", "storyVars",
        "unreadActionStories", "actionLog", "buffCaps", "date",
        "totalOfflineMs", "totals", "challengeSave", "challenge",
        "currentTheme", "repeatLast", "pingOnPause", "notifyOnPause",
        "autoMaxTraining", "highlightNew", "hotkeys", "updateRate",
        "autosaveRate", "responsiveUI", "statColors", "statHints",
        "fractionalMana", "repeatLastAction", "keepCurrentList",
        "bonusIsActive", "storyMaxOld", "totalMoney", "numberOfPrestiges",
        "prestigeCurrentPoints", "prestigeTotalPoints"
    ]);

    const dynamicSaveField = /^(exp|total|checked|goodTemp|good|searchToggler)([A-Za-z][A-Za-z0-9]*)$/;
    const allowedLoops = new Set(["actions", "maxMana", "maxEffort", "knownGood", "unchecked"]);
    const aliases = new Map([
        ["Sell Gold", "Buy Mana Z1"],
        ["Buy Mana", "Buy Mana Z1"],
        ["Buy Mana Challenge", "Buy Mana Z1"],
        ["Purchase Mana", "Buy Mana Z3"],
        ["Tournament", "Buy Pickaxe"],
        ["Train Dex", "Train Dexterity"]
    ]);

    function checkFiniteStructure(object) {
        const stack = [[object, 0]];
        const seen = new Set();
        let count = 0;
        while (stack.length) {
            const [item, depth] = stack.pop();
            if (++count > MAX_NODES) invalid("TOO_COMPLEX", "The save contains too many fields.");
            if (depth > MAX_DEPTH) invalid("TOO_DEEP", "The save is nested too deeply.");
            if (typeof item === "number" && !Number.isFinite(item)) {
                invalid("INVALID_NUMBER", "The save contains a non-finite value.");
            }
            if (item && typeof item === "object") {
                if (seen.has(item)) invalid("CYCLIC", "The save data contains a cycle.");
                seen.add(item);
                for (const [key, value] of Object.entries(item)) {
                    if (key === "__proto__" || key === "prototype" || key === "constructor") {
                        invalid("INVALID_KEY", "The save contains an unsafe field name.");
                    }
                    stack.push([value, depth + 1]);
                }
            }
        }
    }

    function validateActionEntries(entries, label) {
        if (!Array.isArray(entries) || entries.length > MAX_ACTIONS) {
            invalid("INVALID_QUEUE", label + " must be an action list.");
        }
        for (const entry of entries) {
            if (!record(entry) || typeof entry.name !== "string"
                || entry.name.length < 1 || entry.name.length > 200
                || !isFiniteNonnegative(entry.loops) || entry.loops > 1_000_000_000
                || (entry.disabled !== undefined && typeof entry.disabled !== "boolean")
                || (entry.loopsType !== undefined && !allowedLoops.has(entry.loopsType))) {
                invalid("INVALID_QUEUE", label + " has an invalid action.");
            }
        }
    }

    function validateParsed(input, allowedActionVars = null) {
        const knownActionVars = allowedActionVars === null ? null : new Set(allowedActionVars);
        if (!record(input)) invalid("INVALID_ROOT", "The save must contain a JSON object.");
        checkFiniteStructure(input);

        const keys = Object.keys(input);
        // A structurally valid but empty or unrelated object is not a save.
        if (!keys.some(k => k === "stats" || k === "skills" || k === "expWander"
                  || k === "townsUnlocked" || k === "maxTown")) {
            invalid("NO_SAVE_DATA", "The input does not look like a game save.");
        }
        for (const key of keys) {
            const dynamic = dynamicSaveField.exec(key);
            if (!allowedFields.has(key) && !(dynamic && (knownActionVars === null || knownActionVars.has(dynamic[2])))) {
                invalid("UNSUPPORTED_FIELD", "This save contains unsupported data fields. Keep your original export.");
            }
        }
        for (const name of ["stats","skills","buffs","prestigeValues","stonesUsed",
                "storyReqs","storyVars","options","extraOptions","buffCaps","totals","challengeSave"]) {
            if (input[name] !== undefined && !record(input[name])) {
                invalid("INVALID_OBJECT", name + " must be an object.");
            }
        }
        for (const name of ["dungeons","trials","townsUnlocked","completedActions",
                "hiddenVars","loadouts","loadoutnames","unreadActionStories"]) {
            if (input[name] !== undefined && !Array.isArray(input[name])) {
                invalid("INVALID_ARRAY", name + " must be a list.");
            }
        }
        if (input.maxTown !== undefined && (!Number.isInteger(input.maxTown)
            || input.maxTown < 0 || input.maxTown > 8)) {
            invalid("INVALID_TOWN", "The legacy maximum area is invalid.");
        }
        if (input.townsUnlocked && input.townsUnlocked.some(n =>
            !Number.isInteger(n) || n < 0 || n > 8)) {
            invalid("INVALID_TOWN", "The save contains an invalid area.");
        }
        if (input.nextList !== undefined) validateActionEntries(input.nextList, "The action queue");
        if (input.loadouts !== undefined) {
            if (input.loadouts.length > MAX_LOADOUTS) invalid("INVALID_LOADOUT", "Too many loadouts.");
            input.loadouts.forEach((entries, index) => {
                if (entries != null) validateActionEntries(entries, "Loadout " + (index + 1));
            });
        }
        if (input.hiddenVars && input.hiddenVars.some(x => !Array.isArray(x))) {
            invalid("INVALID_HIDDEN", "The hidden-action list is invalid.");
        }
        if (input.dungeons && input.dungeons.some(x => !Array.isArray(x))) {
            invalid("INVALID_DUNGEON", "The dungeon history is invalid.");
        }
        if (input.trials && input.trials.some(x => !Array.isArray(x))) {
            invalid("INVALID_TRIAL", "The trial history is invalid.");
        }
        if (input.storyReqs && Object.values(input.storyReqs).some(x => typeof x !== "boolean")) {
            invalid("INVALID_STORY", "The story flags are invalid.");
        }
        if (input.challenge !== undefined && (!Number.isInteger(input.challenge)
            || input.challenge < 0 || input.challenge > 3)) {
            invalid("INVALID_CHALLENGE", "The legacy challenge mode is invalid.");
        }
        if (input.challengeSave) {
            const c = input.challengeSave;
            if ((c.challengeMode !== undefined && (!Number.isInteger(c.challengeMode)
                || c.challengeMode < 0 || c.challengeMode > 3))
                || (c.inChallenge !== undefined && typeof c.inChallenge !== "boolean")) {
                invalid("INVALID_CHALLENGE", "The challenge state is invalid.");
            }
        }
        for (const key of ["totalOfflineMs","totalTalent","goldInvested"]) {
            if (input[key] !== undefined && !isFiniteNonnegative(input[key])) {
                invalid("INVALID_NUMBER", key + " must be a finite nonnegative number.");
            }
        }
        if (input.date !== undefined && Number.isNaN(Date.parse(input.date))) {
            invalid("INVALID_DATE", "The saved date is invalid.");
        }
        if (input.actionLog !== undefined && !record(input.actionLog)) {
            invalid("INVALID_LOG", "The action log is invalid.");
        }
        return input;
    }

    function normalizeParsed(input, allowedActionVars = null) {
        const copy = JSON.parse(JSON.stringify(validateParsed(input, allowedActionVars)));
        const normalizeList = (list) => {
            for (const entry of list) if (aliases.has(entry.name)) entry.name = aliases.get(entry.name);
        };
        if (copy.nextList) normalizeList(copy.nextList);
        if (copy.loadouts) for (const list of copy.loadouts) if (list) normalizeList(list);
        const legacyChallengeMode = copy.challenge && copy.challenge !== 0 ? copy.challenge : 0;
        if (legacyChallengeMode) {
            copy.challengeSave = {challengeMode: legacyChallengeMode, inChallenge: true};
            delete copy.challenge;
        }
        return {data:copy, legacyChallengeMode};
    }


    // LZString-compatible bounded Base64 decoder. Check the generated output
    // length DURING decompression rather than allocating an expansion bomb
    // before MAX_DECODED_CHARS can be checked.
    function decompressBoundedBase64(input, maxOutput = MAX_DECODED_CHARS) {
        if (typeof input !== "string" || !input.length ||
            !/^[A-Za-z0-9+/]*={0,3}$/.test(input) ||
            !Number.isSafeInteger(maxOutput) || maxOutput < 1) {
            invalid("DECODE", "The save could not be decoded.");
        }
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let index = 1, position = 32;
        let val = alphabet.indexOf(input.charAt(0));
        function readBits(count) {
            let bits = 0, power = 1;
            const end = 2 ** count;
            while (power !== end) {
                if ((val & position) !== 0) bits += power;
                position >>= 1;
                if (position === 0) {
                    position = 32;
                    if (index >= input.length) {
                        invalid("DECODE", "The save is truncated or malformed.");
                    }
                    val = alphabet.indexOf(input.charAt(index++));
                }
                power *= 2;
            }
            return bits;
        }
        const dict = [0, 1, 2];
        let size = 4, enlarge = 4, bits = 3;
        const initial = readBits(2);
        let word;
        if (initial === 0) word = String.fromCharCode(readBits(8));
        else if (initial === 1) word = String.fromCharCode(readBits(16));
        else if (initial === 2) return "";
        else invalid("DECODE", "The save could not be decoded.");
        dict[3] = word;
        const output = [word];
        let outputLength = word.length;
        while (true) {
            const next = readBits(bits);
            let code = next;
            if (code === 0 || code === 1) {
                const symbol = String.fromCharCode(readBits(code === 0 ? 8 : 16));
                dict[size++] = symbol;
                code = size - 1;
                enlarge--;
            } else if (code === 2) {
                return output.join("");
            }
            if (enlarge === 0) {
                enlarge = 2 ** bits;
                bits++;
            }
            let entry = dict[code];
            if (!entry) {
                if (code !== size) invalid("DECODE", "The save contains an invalid compressed reference.");
                entry = word + word.charAt(0);
            }
            if (outputLength + entry.length > maxOutput) {
                invalid("TOO_LARGE", "The decoded save is too large.");
            }
            output.push(entry);
            outputLength += entry.length;
            dict[size++] = word + entry.charAt(0);
            enlarge--;
            word = entry;
            if (enlarge === 0) {
                enlarge = 2 ** bits;
                bits++;
            }
        }
    }

    function prepare(raw, decoders) {
        if (typeof raw !== "string") invalid("INVALID_INPUT", "Choose a text save export.");
        if (raw.length === 0) invalid("EMPTY", "An empty import is not a save.");
        if (raw.length > MAX_ENCODED_CHARS) invalid("TOO_LARGE", "The import is too large.");
        if (/^ILSV\d\d/.test(raw) && !raw.startsWith("ILSV01")) {
            invalid("UNSUPPORTED_VERSION", "This save was written by an unsupported game version.");
        }
        let decoded;
        try {
            decoded = raw.startsWith("ILSV01")
                ? (decoders.boundedDecompress ?? decoders.decompress)(raw.slice(6), MAX_DECODED_CHARS)
                : decoders.legacyDecode(raw);
        } catch (error) {
            if (error instanceof SaveImportError) throw error;
            invalid("DECODE", "The save could not be decoded.");
        }
        if (typeof decoded !== "string" || !decoded.length) {
            invalid("DECODE", "The save could not be decoded.");
        }
        if (decoded.length > MAX_DECODED_CHARS) {
            invalid("TOO_LARGE", "The decoded save is too large.");
        }
        let parsed;
        try {
            parsed = JSON.parse(decoded);
        } catch {
            invalid("INVALID_JSON", "The save contains invalid JSON.");
        }
        const normalized = normalizeParsed(parsed, decoders.allowedActionVars ?? null);
        return {
            ...normalized,
            json:JSON.stringify(normalized.data),
            encoding:raw.startsWith("ILSV01") ? "ILSV01" : "legacy"
        };
    }

    return Object.freeze({
        prepare, validateParsed, normalizeParsed, decompressBoundedBase64, SaveImportError,
        MAX_ENCODED_CHARS, MAX_DECODED_CHARS
    });
})();

if (typeof module !== "undefined" && module.exports) module.exports = SaveImport;
