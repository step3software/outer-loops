// Test-only, source-backed DOM input manifest. No player settings or saves.
import {createHash} from 'node:crypto';

export const UI_SCHEMA = 'balance-ui-input-config/v1';

export class BalanceConfigurationError extends Error {
  constructor(message, code = 'invalid_configuration') {
    super(message);
    this.name = 'BalanceConfigurationError';
    this.code = code;
  }
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => [key, canonical(entry)]));
  }
  return value;
}

export function fingerprint(value) {
  return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function sourceInputs(model) {
  return copy(model.evaluate('({caps: Object.entries(buffCaps).map(([name,cap])=>({name,cap,hard:buffHardCaps[name]})),search: towns.flatMap(t=>t.totalActionList.filter(a=>a.type==="limited").map(a=>a.varName))})'));
}

export function createDefaultUiProfile(model) {
  const source = sourceInputs(model);
  const inputs = {};
  for (const name of new Set(source.search)) {
    inputs['searchToggler' + name] = {
      type: 'checkbox', checked: false,
      source: 'views/main.view.js:createTownInfo:fresh-unchecked'
    };
  }
  for (const cap of source.caps) {
    inputs['buff' + cap.name + 'Cap'] = {
      type: 'number', value: String(cap.cap), parsedCap: cap.cap,
      modelCap: cap.cap, hardCap: cap.hard,
      source: 'saving.js:buffCaps:fresh-model-and-rendered-input'
    };
  }
  return {schema: UI_SCHEMA, changePolicy: 'recorded-ui-events/v1', inputs};
}

function validateManifest(model, profile) {
  if (!profile || profile.schema !== UI_SCHEMA || profile.changePolicy !== 'recorded-ui-events/v1' ||
      !profile.inputs || typeof profile.inputs !== 'object' || Array.isArray(profile.inputs)) {
    throw new BalanceConfigurationError('Unsupported UI input manifest', 'unsupported_runtime');
  }
  const expected = createDefaultUiProfile(model).inputs;
  const actualIds = Object.keys(profile.inputs).sort();
  const expectedIds = Object.keys(expected).sort();
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    throw new BalanceConfigurationError('Required gameplay inputs are missing or unknown', 'unsupported_runtime');
  }
  for (const id of expectedIds) {
    const input = profile.inputs[id];
    const spec = expected[id];
    if (!input || input.type !== spec.type || typeof input.source !== 'string' || !input.source) {
      throw new BalanceConfigurationError('Wrong input type/source for ' + id, 'unsupported_runtime');
    }
    if (spec.type === 'checkbox') {
      if (typeof input.checked !== 'boolean') {
        throw new BalanceConfigurationError('Invalid checkbox value: ' + id);
      }
    } else {
      const parsed = strictCap(input.value, id, spec.hardCap);
      if (input.parsedCap !== parsed || input.modelCap !== parsed ||
          input.hardCap !== spec.hardCap || parsed !== spec.modelCap) {
        throw new BalanceConfigurationError('Cap/DOM/model mismatch for ' + id);
      }
    }
  }
}

function strictCap(value, id, maximum) {
  if (typeof value !== 'string' || !/^(0|[1-9]\d*)$/.test(value)) {
    throw new BalanceConfigurationError('Invalid cap raw value for ' + id);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > maximum) {
    throw new BalanceConfigurationError('Cap outside hard maximum for ' + id);
  }
  return parsed;
}

export function installUiProfile(model, profile = createDefaultUiProfile(model)) {
  if (!model?.sandbox?.HTMLInputElement || !model?.sandbox?.document) {
    throw new BalanceConfigurationError('Balance profile requires the VM view facade', 'unsupported_runtime');
  }
  validateManifest(model, profile);
  const elements = new Map();
  for (const [id, spec] of Object.entries(profile.inputs)) {
    const element = new model.sandbox.HTMLInputElement();
    element.id = id;
    element.type = spec.type;
    if (spec.type === 'checkbox') element.checked = spec.checked;
    else element.value = spec.value;
    elements.set(id, element);
  }
  const originalLookup = model.sandbox.document.getElementById?.bind(model.sandbox.document);
  model.sandbox.document.getElementById = id => elements.get(id) ?? originalLookup?.(id) ?? null;
  model.balanceUI = {elements, profile: copy(profile), changes: []};
  // A strict facade cannot silently choose different initial UI and model caps.
  return readUiProfile(model);
}

export function readUiProfile(model) {
  const ui = model?.balanceUI;
  if (!ui) throw new BalanceConfigurationError('Missing strict UI profile', 'unsupported_runtime');
  const modelCaps = copy(model.evaluate('Object.fromEntries(Object.entries(buffCaps))'));
  const actual = {};
  for (const [id, spec] of Object.entries(ui.profile.inputs)) {
    const element = ui.elements.get(id);
    if (!(element instanceof model.sandbox.HTMLInputElement) || element.type !== spec.type) {
      throw new BalanceConfigurationError('Missing or wrong-type input: ' + id, 'unsupported_runtime');
    }
    if (spec.type === 'checkbox') {
      if (typeof element.checked !== 'boolean') throw new BalanceConfigurationError('Invalid checkbox: ' + id);
      actual[id] = {type: 'checkbox', checked: element.checked};
    } else {
      const name = id.slice(4, -3);
      const parsed = strictCap(element.value, id, spec.hardCap);
      if (modelCaps[name] !== parsed) {
        throw new BalanceConfigurationError('Model/DOM cap mismatch: ' + id);
      }
      actual[id] = {type: 'number', value: element.value, parsedCap: parsed, modelCap: modelCaps[name]};
    }
  }
  return {
    schema: UI_SCHEMA, configurationHash: fingerprint(ui.profile),
    stateHash: fingerprint(actual), inputs: actual,
    changes: copy(ui.changes)
  };
}

export function changeUiInput(model, id, nextValue) {
  const before = readUiProfile(model);
  const ui = model.balanceUI;
  const element = ui.elements.get(id);
  const spec = ui.profile.inputs[id];
  if (!element || !spec) throw new BalanceConfigurationError('Unknown UI setting: ' + id);
  if (spec.type === 'checkbox') {
    if (typeof nextValue !== 'boolean') throw new BalanceConfigurationError('Checkbox requires boolean: ' + id);
    element.checked = nextValue;
  } else {
    const parsed = strictCap(nextValue, id, spec.hardCap);
    element.value = nextValue;
    const name = id.slice(4, -3);
    model.evaluate('buffCaps[' + JSON.stringify(name) + '] = ' + parsed);
  }
  const after = readUiProfile(model);
  const event = {id, beforeHash: before.stateHash, afterHash: after.stateHash, nextValue};
  ui.changes.push(event);
  return event;
}

export function assertMatchingUiProfiles(a, b) {
  if (a.configurationHash !== b.configurationHash || a.stateHash !== b.stateHash ||
      fingerprint(a.changes) !== fingerprint(b.changes)) {
    throw new BalanceConfigurationError('UI configuration/changes differ between runs');
  }
  return true;
}
