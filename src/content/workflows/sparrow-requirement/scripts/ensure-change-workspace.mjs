#!/usr/bin/env node
/**
 * Mechanical change-workspace helper. Run from the project root.
 *
 *   node scripts/ensure-change-workspace.mjs --check
 *   node scripts/ensure-change-workspace.mjs --create <change-id>
 *
 * --check exits 1 when no change-id is confirmed and current/ has no subdirectory.
 * When --check exits 0 and the workspace directory already exists, it writes
 * project.md from the shared template if that file is missing.
 * --create only after the user confirmed a kebab-case change-id. It writes
 * project.md in the same step (existing file is left untouched).
 * State changes go through scripts/sparrow-state.mjs (no direct JSON edits).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHANGE_CURRENT = join('docs', 'sparrow', 'change', 'current');
const STATE_SCRIPT = join('scripts', 'sparrow-state.mjs');
const CONFIG_FILE = join('.sparrow', 'sparrow-config.json');
const PROJECT_MD_TEMPLATE = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'project.md');
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

function renderProjectMd() {
  if (!existsSync(PROJECT_MD_TEMPLATE)) {
    console.error(`Missing project.md template: ${PROJECT_MD_TEMPLATE}`);
    process.exit(1);
  }
  let projectName = '';
  let sparrowVersion = '';
  let toolList = '';
  if (existsSync(CONFIG_FILE)) {
    const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
    if (typeof config.projectName === 'string') projectName = config.projectName;
    if (typeof config.version === 'string') sparrowVersion = config.version;
    if (Array.isArray(config.tools)) {
      toolList = config.tools.filter((id) => typeof id === 'string').join(', ');
    }
  }
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  return readFileSync(PROJECT_MD_TEMPLATE, 'utf8')
    .replaceAll('{projectName}', projectName)
    .replaceAll('{sparrowVersion}', sparrowVersion)
    .replaceAll('{toolList}', toolList)
    .replaceAll('{now}', now);
}

function ensureProjectMd(changeId) {
  const root = join(CHANGE_CURRENT, changeId);
  if (!existsSync(root) || !statSync(root).isDirectory()) return;
  const dest = join(root, 'project.md');
  if (existsSync(dest)) return;
  writeFileSync(dest, renderProjectMd(), 'utf8');
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
  const resolved = id || dirs[0];
  const root = join(CHANGE_CURRENT, resolved);
  if (existsSync(root) && statSync(root).isDirectory()) {
    ensureProjectMd(resolved);
  }
  process.stdout.write(`${resolved}\n`);
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
  ensureProjectMd(id);
  runState(['set-change', id]);
  runState(['set-step', 'requirement', 'ongoing']);
  process.stdout.write(`${root}\n`);
  process.exit(0);
}

failUsage();
