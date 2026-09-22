#!/usr/bin/env node
/**
 * Mechanical change-workspace helper. Run from the project root.
 *
 *   node scripts/ensure-change-workspace.mjs --check
 *   node scripts/ensure-change-workspace.mjs --create <change-id>
 *
 * --check exits 1 when no change-id is confirmed and current/ has no subdirectory.
 * --create only after the user confirmed a kebab-case change-id.
 * State changes go through scripts/sparrow-state.mjs (no direct JSON edits).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CHANGE_CURRENT = join('docs', 'sparrow', 'change', 'current');
const STATE_SCRIPT = join('scripts', 'sparrow-state.mjs');
const WORKSPACE_DIRS = [
  'requirement/business',
  'requirement/quality',
  'requirement/ui',
  'architecture',
  'design',
];

function runState(args) {
  if (!existsSync(STATE_SCRIPT)) {
    console.error('Missing scripts/sparrow-state.mjs. Run sparrow init or sparrow update.');
    process.exit(1);
  }
  const result = spawnSync(process.execPath, [STATE_SCRIPT, ...args], {
    encoding: 'utf8',
    cwd: process.cwd(),
  });
  if (result.status !== 0) {
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.stdout) process.stderr.write(result.stdout);
    process.exit(result.status ?? 1);
  }
  return result.stdout;
}

function readActiveChangeId() {
  const raw = runState(['show']);
  const data = JSON.parse(raw);
  const id = data?.['active-change']?.changeId;
  return typeof id === 'string' && id.length > 0 ? id : null;
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
  if (id && dirs.length > 0 && !dirs.includes(id)) {
    console.error(
      `active-change.changeId "${id}" does not match change/current/ (${dirs.join(', ')}).`
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
  runState(['set-change', id]);
  runState(['set-step', 'requirement', 'ongoing']);
  process.stdout.write(`${root}\n`);
  process.exit(0);
}

failUsage();
