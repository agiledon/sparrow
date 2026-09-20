#!/usr/bin/env node
/**
 * Mechanical change-workspace helper. Run from the project root.
 *
 *   node scripts/ensure-change-workspace.mjs --check
 *   node scripts/ensure-change-workspace.mjs --create <change-id>
 *
 * --check exits 1 when no change-id is confirmed and current/ has no subdirectory.
 * --create only after the user confirmed a kebab-case change-id.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CHANGE_CURRENT = join('docs', 'sparrow', 'change', 'current');
const STATE = join('.sparrow', 'sparrow-state.json');
const WORKSPACE_DIRS = [
  'requirement/business',
  'requirement/quality',
  'requirement/ui',
  'architecture',
  'design',
];

function defaultState() {
  return {
    'active-change': { changeId: null },
    'development-mode': 'tbd',
    pipeline: null,
  };
}

function loadState() {
  if (!existsSync(STATE)) return defaultState();
  try {
    const data = JSON.parse(readFileSync(STATE, 'utf8'));
    return {
      'active-change': {
        changeId:
          typeof data?.['active-change']?.changeId === 'string' && data['active-change'].changeId.length > 0
            ? data['active-change'].changeId
            : null,
      },
      'development-mode': data['development-mode'] || 'tbd',
      pipeline: data['development-mode'] === 'tbd' ? null : data.pipeline ?? null,
    };
  } catch {
    return defaultState();
  }
}

function readActiveChangeId() {
  return loadState()['active-change'].changeId;
}

function writeChangeId(id) {
  const state = loadState();
  state['active-change'] = { changeId: id };
  if (state['development-mode'] === 'tbd') state.pipeline = null;
  mkdirSync('.sparrow', { recursive: true });
  writeFileSync(STATE, `${JSON.stringify(state, null, 2)}\n`);
}

function listCurrent() {
  if (!existsSync(CHANGE_CURRENT)) return [];
  return readdirSync(CHANGE_CURRENT).filter((name) => {
    const p = join(CHANGE_CURRENT, name);
    return statSync(p).isDirectory();
  });
}

function failUsage() {
  console.error('Usage:');
  console.error('  node scripts/ensure-change-workspace.mjs --check');
  console.error('  node scripts/ensure-change-workspace.mjs --create <change-id>');
  process.exit(2);
}

const [cmd, changeIdArg] = process.argv.slice(2);

if (cmd === '--check') {
  const id = readActiveChangeId();
  const dirs = listCurrent();
  if (!id && dirs.length === 0) {
    console.error(
      'No change-id confirmed. Do not create change/current/{id}/. Confirm change-id with the user first.'
    );
    process.exit(1);
  }
  process.stdout.write(`${id || dirs[0]}\n`);
  process.exit(0);
}

if (cmd === '--create') {
  const id = changeIdArg;
  if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    console.error('change-id must be kebab-case.');
    process.exit(1);
  }
  const root = join(CHANGE_CURRENT, id);
  mkdirSync(root, { recursive: true });
  for (const dir of WORKSPACE_DIRS) {
    mkdirSync(join(root, dir), { recursive: true });
  }
  writeChangeId(id);
  process.stdout.write(`${root}\n`);
  process.exit(0);
}

failUsage();
