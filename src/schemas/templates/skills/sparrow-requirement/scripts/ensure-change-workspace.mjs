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
const ACTIVE = join('.sparrow', 'active-change.json');
const WORKSPACE_DIRS = [
  'requirement/business',
  'requirement/quality',
  'requirement/ui',
  'architecture',
  'design',
];

function readActiveChangeId() {
  if (!existsSync(ACTIVE)) return null;
  try {
    const data = JSON.parse(readFileSync(ACTIVE, 'utf8'));
    return typeof data.changeId === 'string' && data.changeId.length > 0 ? data.changeId : null;
  } catch {
    return null;
  }
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
  mkdirSync('.sparrow', { recursive: true });
  writeFileSync(ACTIVE, `${JSON.stringify({ changeId: id }, null, 2)}\n`);
  process.stdout.write(`${root}\n`);
  process.exit(0);
}

failUsage();
