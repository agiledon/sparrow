#!/usr/bin/env node
/**
 * Mechanical sparrow-state.json helper. Run from the project root.
 *
 *   node scripts/sparrow-state.mjs show
 *   node scripts/sparrow-state.mjs detect-mode
 *   node scripts/sparrow-state.mjs set-mode <tbd|greenfield|brownfield|iteration>
 *   node scripts/sparrow-state.mjs set-change <id|null>
 *   node scripts/sparrow-state.mjs set-step <step> <ongoing|done>
 *   node scripts/sparrow-state.mjs set-context <slug> <step> <ongoing|done>
 *   node scripts/sparrow-state.mjs check-archive [change-id]
 *   node scripts/sparrow-state.mjs prune-contexts <slug> [slug...]
 *   node scripts/sparrow-state.mjs archive-done
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';

const STATE = join('.sparrow', 'sparrow-state.json');
const CHANGE_CURRENT = join('docs', 'sparrow', 'change', 'current');
const CHANGE_ARCHIVE = join('docs', 'sparrow', 'change', 'archive');
const MASTER_ROOT = join('docs', 'sparrow', 'master');
const SPARROW_DOCS = join('docs', 'sparrow');

const MODES = new Set(['tbd', 'greenfield', 'brownfield', 'iteration']);
const STEPS = new Set(['requirement', 'arch', 'design', 'model', 'plan', 'apply', 'verify', 'archive']);
const STATUSES = new Set(['ongoing', 'done']);

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage', '.sparrow',
  '.cursor', '.claude', '.codex', '.opencode', '.qoder', '.trae', '.pi', '.kiro',
  'vendor', '.github', 'bin',
]);
const SOURCE_EXT = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.go', '.java', '.kt',
  '.cs', '.rb', '.rs', '.php', '.swift', '.c', '.cc', '.cpp', '.h', '.hpp',
  '.m', '.mm', '.scala', '.vue', '.svelte',
]);

function defaultState() {
  return {
    'active-change': { changeId: null },
    'development-mode': 'tbd',
    pipeline: null,
  };
}

function normalize(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const active = src['active-change'] && typeof src['active-change'] === 'object' ? src['active-change'] : {};
  const changeId = typeof active.changeId === 'string' && active.changeId.length > 0 ? active.changeId : null;
  const mode = MODES.has(src['development-mode']) ? src['development-mode'] : 'tbd';
  let pipeline = null;
  if (mode !== 'tbd' && src.pipeline && typeof src.pipeline === 'object') {
    const p = src.pipeline;
    const step = STEPS.has(p['current-step']) ? p['current-step'] : 'requirement';
    const status = STATUSES.has(p.status) ? p.status : 'ongoing';
    const contexts = {};
    if (p.contexts && typeof p.contexts === 'object') {
      for (const [slug, value] of Object.entries(p.contexts)) {
        if (!value || typeof value !== 'object') continue;
        if (!STEPS.has(value['current-step']) || !STATUSES.has(value.status)) continue;
        contexts[slug] = { 'current-step': value['current-step'], status: value.status };
      }
    }
    pipeline = { 'current-step': step, status, contexts };
  }
  return {
    'active-change': { changeId },
    'development-mode': mode,
    pipeline: mode === 'tbd' ? null : pipeline,
  };
}

function load() {
  if (!existsSync(STATE)) return defaultState();
  try {
    return normalize(JSON.parse(readFileSync(STATE, 'utf8')));
  } catch {
    return defaultState();
  }
}

function save(state) {
  const normalized = normalize(state);
  mkdirSync(dirname(STATE), { recursive: true });
  writeFileSync(STATE, `${JSON.stringify(normalized, null, 2)}\n`);
  return normalized;
}

function dirHasFiles(dir) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return false;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (dirHasFiles(full)) return true;
    } else {
      return true;
    }
  }
  return false;
}

function hasSourceFiles(root = '.') {
  const skipAbs = SPARROW_DOCS;
  const walk = (dir) => {
    if (!existsSync(dir) || !statSync(dir).isDirectory()) return false;
    for (const name of readdirSync(dir)) {
      if (IGNORE_DIRS.has(name)) continue;
      const full = join(dir, name);
      if (full === skipAbs || full.startsWith(`${skipAbs}/`) || full.startsWith(`${skipAbs}\\`)) continue;
      const st = statSync(full);
      if (st.isDirectory()) {
        if (walk(full)) return true;
      } else if (SOURCE_EXT.has(extname(name).toLowerCase())) {
        return true;
      }
    }
    return false;
  };
  return walk(root);
}

function detectMode() {
  const reasons = [];
  const currentHas = dirHasFiles(CHANGE_CURRENT);
  const archiveHas = dirHasFiles(CHANGE_ARCHIVE);
  const masterHas = dirHasFiles(MASTER_ROOT);
  if (currentHas) reasons.push('change/current has documents');
  if (archiveHas) reasons.push('change/archive has documents');
  if (masterHas) reasons.push('master has documents');
  if (currentHas || archiveHas || masterHas) {
    return { mode: 'iteration', reasons };
  }
  if (hasSourceFiles('.')) {
    reasons.push('archive and change are empty; source files found');
    return { mode: 'brownfield', reasons };
  }
  reasons.push('archive and change are empty; no source files found');
  return { mode: 'greenfield', reasons };
}

function listDesignSlugs(changeId) {
  const dir = join(CHANGE_CURRENT, changeId, 'design');
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir)
    .filter((name) => statSync(join(dir, name)).isDirectory())
    .sort();
}

function isSlugReady(ctx) {
  return ctx && ctx['current-step'] === 'verify' && ctx.status === 'done';
}

function checkArchive(changeIdArg) {
  const state = load();
  const changeId = changeIdArg || state['active-change'].changeId;
  const contexts = (state.pipeline && state.pipeline.contexts) || {};
  const designSlugs = changeId ? listDesignSlugs(changeId) : [];
  const slugSet = new Set([...Object.keys(contexts), ...designSlugs]);
  const ready = [];
  const incomplete = [];
  for (const slug of [...slugSet].sort()) {
    const ctx = contexts[slug];
    if (isSlugReady(ctx)) {
      ready.push({
        slug,
        'current-step': ctx['current-step'],
        status: ctx.status,
        ready: true,
        reason: 'verify done',
      });
    } else {
      const step = ctx ? ctx['current-step'] : null;
      const status = ctx ? ctx.status : null;
      let reason = 'missing pipeline context';
      if (ctx) {
        reason =
          step === 'verify' && status !== 'done'
            ? 'verify not done'
            : `at ${step}/${status}; need verify/done`;
      }
      incomplete.push({
        slug,
        'current-step': step,
        status,
        ready: false,
        reason,
      });
    }
  }
  return {
    changeId,
    pipelineStep: state.pipeline ? state.pipeline['current-step'] : null,
    pipelineStatus: state.pipeline ? state.pipeline.status : null,
    ready,
    incomplete,
    allComplete: incomplete.length === 0 && ready.length > 0,
    canPartialArchive: ready.length > 0,
  };
}

function failUsage() {
  console.error('Usage:');
  console.error('  node scripts/sparrow-state.mjs show');
  console.error('  node scripts/sparrow-state.mjs detect-mode');
  console.error('  node scripts/sparrow-state.mjs set-mode <tbd|greenfield|brownfield|iteration>');
  console.error('  node scripts/sparrow-state.mjs set-change <id|null>');
  console.error('  node scripts/sparrow-state.mjs set-step <step> <ongoing|done>');
  console.error('  node scripts/sparrow-state.mjs set-context <slug> <step> <ongoing|done>');
  console.error('  node scripts/sparrow-state.mjs check-archive [change-id]');
  console.error('  node scripts/sparrow-state.mjs prune-contexts <slug> [slug...]');
  console.error('  node scripts/sparrow-state.mjs archive-done');
  process.exit(2);
}

const [cmd, ...args] = process.argv.slice(2);

if (cmd === 'show') {
  process.stdout.write(`${JSON.stringify(load(), null, 2)}\n`);
  process.exit(0);
}

if (cmd === 'detect-mode') {
  process.stdout.write(`${JSON.stringify(detectMode(), null, 2)}\n`);
  process.exit(0);
}

if (cmd === 'set-mode') {
  const mode = args[0];
  if (!MODES.has(mode)) failUsage();
  const state = load();
  state['development-mode'] = mode;
  if (mode === 'tbd' || mode === 'brownfield') state.pipeline = null;
  process.stdout.write(`${JSON.stringify(save(state), null, 2)}\n`);
  process.exit(0);
}

if (cmd === 'set-change') {
  const raw = args[0];
  if (!raw) failUsage();
  const id = raw === 'null' ? null : raw;
  if (id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    console.error('change-id must be kebab-case or null.');
    process.exit(1);
  }
  const state = load();
  state['active-change'] = { changeId: id };
  process.stdout.write(`${JSON.stringify(save(state), null, 2)}\n`);
  process.exit(0);
}

if (cmd === 'set-step') {
  const [step, status] = args;
  if (!STEPS.has(step) || !STATUSES.has(status)) failUsage();
  const state = load();
  if (state['development-mode'] === 'tbd') {
    console.error('Cannot set pipeline while development-mode is tbd.');
    process.exit(1);
  }
  const pipeline = state.pipeline || { 'current-step': step, status, contexts: {} };
  pipeline['current-step'] = step;
  pipeline.status = status;
  pipeline.contexts = pipeline.contexts || {};
  state.pipeline = pipeline;
  process.stdout.write(`${JSON.stringify(save(state), null, 2)}\n`);
  process.exit(0);
}

if (cmd === 'set-context') {
  const [slug, step, status] = args;
  if (!slug || !STEPS.has(step) || !STATUSES.has(status)) failUsage();
  const state = load();
  if (state['development-mode'] === 'tbd') {
    console.error('Cannot set pipeline while development-mode is tbd.');
    process.exit(1);
  }
  const pipeline = state.pipeline || { 'current-step': step, status, contexts: {} };
  pipeline['current-step'] = step;
  pipeline.status = status;
  pipeline.contexts = { ...(pipeline.contexts || {}), [slug]: { 'current-step': step, status } };
  state.pipeline = pipeline;
  process.stdout.write(`${JSON.stringify(save(state), null, 2)}\n`);
  process.exit(0);
}

if (cmd === 'check-archive') {
  process.stdout.write(`${JSON.stringify(checkArchive(args[0]), null, 2)}\n`);
  process.exit(0);
}

if (cmd === 'prune-contexts') {
  if (args.length === 0) failUsage();
  const state = load();
  if (!state.pipeline) {
    process.stdout.write(`${JSON.stringify(save(state), null, 2)}\n`);
    process.exit(0);
  }
  const contexts = { ...(state.pipeline.contexts || {}) };
  for (const slug of args) {
    delete contexts[slug];
  }
  state.pipeline = { ...state.pipeline, contexts };
  process.stdout.write(`${JSON.stringify(save(state), null, 2)}\n`);
  process.exit(0);
}

if (cmd === 'archive-done') {
  const state = load();
  const mode = state['development-mode'] === 'greenfield' ? 'iteration' : state['development-mode'];
  const next = {
    'active-change': { changeId: null },
    'development-mode': mode === 'tbd' ? 'iteration' : mode,
    pipeline: null,
  };
  process.stdout.write(`${JSON.stringify(save(next), null, 2)}\n`);
  process.exit(0);
}

failUsage();
