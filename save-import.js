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
    const MAX_LOADOUTS = 16;
    const MAX_LEGACY_CODES = 400_000;

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

    function validateActionEntries(entries, label, knownNames = null) {
        if (!Array.isArray(entries) || entries.length > MAX_ACTIONS) {
            invalid("INVALID_QUEUE", label + " must be an action list.");
        }
        for (const entry of entries) {
            if (!record(entry) || typeof entry.name !== "string"
                || entry.name.length < 1 || entry.name.length > 200
                || (knownNames && !knownNames.has(entry.name) && !aliases.has(entry.name))
                || Object.keys(entry).some(k => !["name","loops","disabled","collapsed","loopsType","actionId"].includes(k))
                || (entry.collapsed !== undefined && typeof entry.collapsed !== "boolean")
                || (entry.actionId !== undefined && (!Number.isSafeInteger(entry.actionId) || entry.actionId < 0))
                || !isFiniteNonnegative(entry.loops) || entry.loops > 1_000_000_000
                || (entry.disabled !== undefined && typeof entry.disabled !== "boolean")
                || (entry.loopsType !== undefined && !allowedLoops.has(entry.loopsType))) {
                invalid("INVALID_QUEUE", label + " has an invalid action.");
            }
        }
    }


    // The importing game passes its current registry as plain data: validation
    // stays pure and recognizes only state that doLoad/doSave can roundtrip.
    function validateDomain(input, contract = {}) {
        const num = (v,label,min=0,integer=false) => {
            if (typeof v!=="number" || !Number.isFinite(v) || v<min || (integer && !Number.isInteger(v)))
                invalid("INVALID_NUMBER",label+" must be a finite number.");
        };
        const allowed = (value, keys,label) => {
            if (!record(value)) invalid("INVALID_OBJECT",label+" must be an object.");
            for (const key of Object.keys(value))
                if (!keys.has(key)) invalid("UNSUPPORTED_FIELD",label+" contains an unsupported field.");
        };
        const named = (obj,names,label,check) => {
            if (obj === undefined) return;
            if (!record(obj)) invalid("INVALID_OBJECT",label+" must be an object.");
            for (const [key,value] of Object.entries(obj)) {
                if (names && !names.has(key)) invalid("UNSUPPORTED_FIELD",label+" contains an unknown entry.");
                check(value,label+"."+key,key);
            }
        };
        const level = (obj,label) => {
            allowed(obj,new Set(["level","exp"]),label);
            if (obj.level !== undefined) num(obj.level,label+".level",0,true);
            if (obj.exp !== undefined) num(obj.exp,label+".exp");
        };
        named(input.stats,new Set(contract.statNames ?? ["Dex","Str","Con","Spd","Per","Cha","Int","Luck","Soul"]),"stats",(obj,label,key) => {
            allowed(obj,new Set(["name","statLevelExp","talentLevelExp","soullessLevelExp","soulstone","prestigeBuff","exp","talent"]),label);
            if(obj.name!==undefined && obj.name!==key) invalid("INVALID_OBJECT",label+" has mismatched identity.");
            for (const key of ["statLevelExp","talentLevelExp","soullessLevelExp"]) if (obj[key]!==undefined) level(obj[key],label+"."+key);
            for (const key of ["soulstone","exp","talent"]) if (obj[key]!==undefined) num(obj[key],label+"."+key);
            if (obj.prestigeBuff!==undefined && !["PrestigePhysical","PrestigeMental"].includes(obj.prestigeBuff))
                invalid("INVALID_OBJECT",label+" has an invalid modifier.");
        });
        named(input.skills,new Set(contract.skillNames ?? ["Combat","Magic","Practical","Alchemy","Crafting","Dark","Chronomancy","Pyromancy","Restoration","Spatiomancy","Mercantilism","Divine","Commune","Wunderkind","Gluttony","Thievery","Leadership","Assassin"]),"skills",(obj,label,key) => {
            allowed(obj,new Set(["name","levelExp","statLevelExp","change","exp"]),label);
            if(obj.name!==undefined && obj.name!==key) invalid("INVALID_OBJECT",label+" has mismatched identity.");
            for (const key of ["levelExp","statLevelExp"]) if (obj[key]!==undefined) level(obj[key],label+"."+key);
            if (obj.exp!==undefined) num(obj.exp,label+".exp");
            if (obj.change!==undefined) {num(obj.change,label+".change",0,true);if(obj.change>3) invalid("INVALID_NUMBER",label+" has unsupported skill type.");}
        });
        const buffs=new Set(contract.buffNames ?? ["Ritual","Imbuement","Imbuement2","Feast","Aspirant","Heroism","Imbuement3","PrestigePhysical","PrestigeMental","PrestigeCombat","PrestigeSpatiomancy","PrestigeChronomancy","PrestigeBartering","PrestigeExpOverflow"]);
        named(input.buffs,buffs,"buffs",(obj,label,key) => {
            allowed(obj,new Set(["name","amt"]),label);
            if(obj.name!==undefined && obj.name!==key) invalid("INVALID_OBJECT",label+" has mismatched identity.");
            if (obj.amt!==undefined) num(obj.amt,label+".amt");
        });
        named(input.buffCaps,buffs,"buffCaps",(v,label)=>num(v,label));
        named(input.prestigeValues,new Set(["prestigeCurrentPoints","prestigeTotalPoints","prestigeTotalCompletions","completedCurrentPrestige","completedAnyPrestige"]),"prestigeValues",(v,label,key) => {
            if (key.startsWith("completed")) {
                if (typeof v!=="boolean" && v!==0 && v!==1) invalid("INVALID_FLAG",label+" must be a boolean.");
            } else num(v,label);
        });
        named(input.stonesUsed,new Set(["1","3","5","6"]),"stonesUsed",(v,label)=>num(v,label));
        named(input.totals,new Set(["time","effectiveTime","borrowedTime","loops","actions"]),"totals",(v,label,k)=>num(v,label,k==="borrowedTime"?-Number.MAX_VALUE:0));
        named(input.challengeSave,new Set(["challengeMode","inChallenge"]),"challengeSave",(v,label,k)=>{
            if(k==="challengeMode"){num(v,label,0,true);if(v>3) invalid("INVALID_CHALLENGE",label+" is not supported.");}
            else if(typeof v!=="boolean") invalid("INVALID_FLAG",label+" must be a boolean.");
        });
        named(input.storyReqs,contract.storyFlags?new Set(contract.storyFlags):null,"storyReqs",(v,label)=>{
            if(typeof v!=="boolean") invalid("INVALID_FLAG",label+" must be a boolean.");
        });
        named(input.storyVars,contract.storyVars?new Set(contract.storyVars):null,"storyVars",(v,label)=>num(v,label,-Number.MAX_VALUE));
        for (const name of ["options","extraOptions"]) {
            named(input[name],contract.optionTypes?new Set(Object.keys(contract.optionTypes)):null,name,(v,label,k)=>{
                const type=contract.optionTypes?.[k];
                if ((type && typeof v!==type) || (!type && !["boolean","string","number"].includes(typeof v)))
                    invalid("INVALID_OPTION",label+" has an unsupported type.");
                if(typeof v==="number") num(v,label,-Number.MAX_VALUE);
            });
        }
        for(const key of ["totalTalent","goldInvested","totalOfflineMs","storyMax","storyShowing","curLoadout","totalMoney","prestigeCurrentPoints","prestigeTotalPoints","numberOfPrestiges","updateRate","autosaveRate"])
            if(input[key]!==undefined) num(input[key],key);
        for(const key of ["repeatLast","pingOnPause","notifyOnPause","autoMaxTraining","highlightNew","hotkeys","responsiveUI","statColors","statHints","fractionalMana","repeatLastAction","keepCurrentList","bonusIsActive"])
            if(input[key]!==undefined && typeof input[key]!=="boolean") invalid("INVALID_FLAG",key+" must be a boolean.");
        if(input.version75!==undefined && typeof input.version75!=="boolean" && input.version75!==0 && input.version75!==1)
            invalid("INVALID_FLAG","version75 is not a supported flag.");
        if(input.currentTheme!==undefined && typeof input.currentTheme!=="string")
            invalid("INVALID_OPTION","currentTheme must be text.");
        for(const key of ["completedActions","loadoutnames","unreadActionStories"])
            if(input[key]!==undefined && (!Array.isArray(input[key]) || input[key].some(x=>typeof x!=="string")))
                invalid("INVALID_ARRAY",key+" must contain strings.");
        if(input.hiddenVars!==undefined && (!Array.isArray(input.hiddenVars) || input.hiddenVars.some(x=>!Array.isArray(x)||x.some(y=>typeof y!=="string"))))
            invalid("INVALID_HIDDEN","Hidden action lists must contain text.");
        for(const name of ["dungeons","trials"]) {
            if(input[name]===undefined) continue;
            for(const [i,group] of input[name].entries()) {
                if(!Array.isArray(group)) invalid("INVALID_ARRAY",name+" must contain floor lists.");
                for(const [j,floor] of group.entries()) {
                    if(floor===null) continue; // historically missing floors are reconstructed
                    const label=name+"["+i+"]["+j+"]";
                    allowed(floor,new Set(name==="dungeons"?["completed","ssChance","lastStat"]:["completed"]),label);
                    if(floor.completed!==undefined) num(floor.completed,label+".completed",0,true);
                    if(floor.ssChance!==undefined) num(floor.ssChance,label+".ssChance");
                    if(floor.lastStat!==undefined && typeof floor.lastStat!=="string")
                        invalid("INVALID_OBJECT",label+".lastStat must be text.");
                }
            }
        }
        if(input.actionLog!==undefined) {
            // ActionLog.toJSON() returns extractStrings(entries): [dictionary, rows].
            const log=input.actionLog;
            if(Array.isArray(log)){
                if(log.length!==2||!Array.isArray(log[0])||!Array.isArray(log[1])||
                    log[0].some(v=>typeof v!=="string"&&(typeof v!=="number"||!Number.isFinite(v))))
                    invalid("INVALID_LOG","Action log has an invalid compressed format.");
                // Compressed row data contains dictionary references, not
                // arbitrary additional save objects that will be discarded.
                const pending=[log[1]];
                while(pending.length){
                    const node=pending.pop();
                    if (Array.isArray(node)) {
                        pending.push(...node);
                    } else if (record(node)) {
                        for(const [key,value] of Object.entries(node)){
                            if(!/^\d+$/.test(key) || +key>=log[0].length)
                                invalid("INVALID_LOG","Action log references an unknown field.");
                            pending.push(value);
                        }
                    } else if (node !== null && typeof node !== "boolean" &&
                        (!Number.isInteger(node) || node < 0 || node >= log[0].length)) {
                        invalid("INVALID_LOG","Action log references unknown data.");
                    }
                }
            } else if(!record(log)||Object.keys(log).length)
                invalid("INVALID_LOG","Action log has an unsupported format.");
        }
    }

    function validateParsed(input, allowedActionVars = null, contract = {}) {
        const knownActionVars = allowedActionVars === null ? null : new Set(allowedActionVars);
        const actionsByVar = contract.actions ? new Map(contract.actions.map(a=>[a.varName,a.type])) : null;
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
            const actionType = dynamic && actionsByVar?.get(dynamic[2]);
            const allowedFamily = !actionsByVar || !dynamic || (
                (dynamic[1]==="exp" && actionType==="progress") ||
                (dynamic[1]==="total" && ["limited","multipart"].includes(actionType)) ||
                (["checked","good","goodTemp","searchToggler"].includes(dynamic[1]) && actionType==="limited")
            );
            if (!allowedFields.has(key) && !(dynamic && (knownActionVars === null || knownActionVars.has(dynamic[2])) && allowedFamily)) {
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
        const knownActionNames = contract.actions ? new Set(contract.actions.map(action=>action.name)) : null;
        if (input.nextList !== undefined) validateActionEntries(input.nextList, "The action queue", knownActionNames);
        if (input.loadouts !== undefined) {
            if (input.loadouts.length > MAX_LOADOUTS) invalid("INVALID_LOADOUT", "Too many loadouts.");
            input.loadouts.forEach((entries, index) => {
                if (entries != null) validateActionEntries(entries, "Loadout " + (index + 1), knownActionNames);
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
        validateDomain(input,contract);
        for(const [key,value] of Object.entries(input)){
            const dynamic=dynamicSaveField.exec(key);
            if(!dynamic || allowedFields.has(key)) continue;
            if(dynamic[1]==="searchToggler") {
                if(typeof value!=="boolean") invalid("INVALID_FLAG",key+" must be a boolean.");
            } else if(!isFiniteNonnegative(value))
                invalid("INVALID_NUMBER",key+" must be a finite nonnegative number.");
        }
        return input;
    }

    function normalizeParsed(input, allowedActionVars = null, contract = {}) {
        const copy = JSON.parse(JSON.stringify(validateParsed(input, allowedActionVars, contract)));
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


    // Pre-v0.94 format: Base64(UTF8(LZW-code-units)). First decode only
    // the size-bounded compressed stream, then cap every expanded phrase.
    function decompressBoundedLegacy(input, decodeBase64, maxOutput = MAX_DECODED_CHARS) {
        if (typeof input!=="string" || !Number.isSafeInteger(maxOutput) || maxOutput<1)
            invalid("DECODE","Invalid legacy save input.");
        const encoded=input.replace(/\s+/g,"");
        if (!encoded.length || encoded.length>MAX_ENCODED_CHARS ||
            encoded.length%4!==0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded))
            invalid("DECODE","The legacy save is not valid Base64.");
        let compressed;
        try { compressed=decodeBase64(encoded); }
        catch { invalid("DECODE","The legacy save could not be decoded."); }
        if (typeof compressed!=="string" || !compressed.length)
            invalid("DECODE","The legacy save could not be decoded.");
        if (compressed.length>MAX_LEGACY_CODES)
            invalid("TOO_COMPLEX","The legacy save contains too many compressed codes.");
        let previous=compressed.charAt(0);
        const output=[previous], dictionary=new Map();
        let produced=previous.length, nextCode=256;
        for (let i=1;i<compressed.length;i++) {
            const code=compressed.charCodeAt(i);
            let phrase;
            if (code<256) phrase=compressed.charAt(i);
            else if (dictionary.has(code)) phrase=dictionary.get(code);
            else phrase=previous+previous.charAt(0);
            // Preserve the original LZWDecode's fallback for old codewords:
            // some historical data relies on it. Invalid output will still
            // fail JSON/shape validation before any save is modified.
            if (produced+phrase.length>maxOutput)
                invalid("TOO_LARGE","The decoded legacy save is too large.");
            output.push(phrase);
            produced+=phrase.length;
            dictionary.set(nextCode++,previous+phrase.charAt(0));
            previous=phrase;
        }
        return output.join("");
    }


    // Validate previously persisted JSON as-is. The candidate is used only
    // for safety checks; callers must commit the original bytes unchanged.
    function prepareStoredJson(raw, decoders) {
        if (typeof raw!=="string" || !raw.length || raw.length>MAX_DECODED_CHARS)
            invalid("TOO_LARGE","The saved backup cannot be validated.");
        let parsed;
        try { parsed=JSON.parse(raw); }
        catch { invalid("INVALID_JSON","The saved backup is malformed."); }
        return normalizeParsed(parsed, decoders.allowedActionVars ?? null, decoders.contract ?? {});
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
                : (decoders.boundedLegacyDecode ?? decoders.legacyDecode)(raw);
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
        const normalized = normalizeParsed(parsed, decoders.allowedActionVars ?? null, decoders.contract ?? {});
        return {
            ...normalized,
            json:JSON.stringify(normalized.data),
            encoding:raw.startsWith("ILSV01") ? "ILSV01" : "legacy"
        };
    }

    return Object.freeze({
        prepare, prepareStoredJson, validateParsed, normalizeParsed, decompressBoundedBase64, decompressBoundedLegacy, SaveImportError,
        MAX_ENCODED_CHARS, MAX_DECODED_CHARS
    });
})();

if (typeof module !== "undefined" && module.exports) module.exports = SaveImport;
