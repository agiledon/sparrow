import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyArchiveComplete,
  applyDevelopmentMode,
  applyPipelineStep,
  detectDevelopmentMode,
  ensureProjectState,
  loadProjectState,
  normalizeProjectState,
  resetProjectState,
  saveProjectState,
  wipeSpecTrees,
} from './project-state.js';
import {
  CHANGE_ARCHIVE,
  CHANGE_CURRENT,
  CONFIG_FILE,
  LEGACY_ACTIVE_CHANGE_FILE,
  LEGACY_CONFIG_FILE,
  MASTER_ROOT,
  STATE_FILE,
} from './spec-paths.js';
import { generateProjectConfig } from './skill-generation.js';

function tmpRoot(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

test('tbd forces pipeline to null', () => {
  const state = normalizeProjectState({
    'active-change': { changeId: 'x' },
    'development-mode': 'tbd',
    pipeline: { 'current-step': 'requirement', status: 'ongoing', contexts: {} },
  });
  assert.equal(state.pipeline, null);
  assert.equal(state['active-change'].changeId, 'x');
});

test('ensureProjectState migrates active-change.json and does not overwrite', () => {
  const root = tmpRoot('sparrow-state-');
  mkdirSync(join(root, '.sparrow'), { recursive: true });
  writeFileSync(join(root, LEGACY_ACTIVE_CHANGE_FILE), JSON.stringify({ changeId: 'first-ddd' }) + '\n');

  const first = ensureProjectState(root);
  assert.equal(first.created, true);
  assert.equal(first.state['active-change'].changeId, 'first-ddd');
  assert.equal(first.state['development-mode'], 'tbd');
  assert.equal(first.state.pipeline, null);
  assert.ok(!existsSync(join(root, LEGACY_ACTIVE_CHANGE_FILE)));

  saveProjectState(root, applyDevelopmentMode(first.state, 'greenfield'));
  const second = ensureProjectState(root);
  assert.equal(second.created, false);
  assert.equal(second.state['development-mode'], 'greenfield');
});

test('detect-mode: empty specs without source → greenfield', () => {
  const root = tmpRoot('sparrow-detect-gf-');
  mkdirSync(join(root, CHANGE_CURRENT), { recursive: true });
  mkdirSync(join(root, CHANGE_ARCHIVE), { recursive: true });
  mkdirSync(join(root, MASTER_ROOT), { recursive: true });
  writeFileSync(join(root, 'README.md'), '# docs only\n');
  const result = detectDevelopmentMode(root);
  assert.equal(result.mode, 'greenfield');
});

test('detect-mode: empty specs with source → brownfield', () => {
  const root = tmpRoot('sparrow-detect-bf-');
  mkdirSync(join(root, CHANGE_CURRENT), { recursive: true });
  mkdirSync(join(root, CHANGE_ARCHIVE), { recursive: true });
  mkdirSync(join(root, MASTER_ROOT), { recursive: true });
  mkdirSync(join(root, 'src'), { recursive: true });
  writeFileSync(join(root, 'src', 'main.ts'), 'export {}\n');
  const result = detectDevelopmentMode(root);
  assert.equal(result.mode, 'brownfield');
});

test('detect-mode: archive or current or master docs → iteration', () => {
  const root = tmpRoot('sparrow-detect-it-');
  mkdirSync(join(root, CHANGE_CURRENT), { recursive: true });
  mkdirSync(join(root, CHANGE_ARCHIVE, '2026-01-01-first'), { recursive: true });
  mkdirSync(join(root, MASTER_ROOT), { recursive: true });
  writeFileSync(join(root, CHANGE_ARCHIVE, '2026-01-01-first', 'proposal.md'), '# archived\n');
  assert.equal(detectDevelopmentMode(root).mode, 'iteration');
});

test('cannot set pipeline while tbd', () => {
  const state = loadProjectState(tmpRoot('sparrow-tbd-pipe-'));
  assert.throws(() => applyPipelineStep(state, 'requirement', 'ongoing'));
});

test('archive-done clears changeId and promotes greenfield to iteration', () => {
  const next = applyArchiveComplete({
    'active-change': { changeId: 'first-ddd' },
    'development-mode': 'greenfield',
    pipeline: { 'current-step': 'archive', status: 'ongoing', contexts: {} },
  });
  assert.equal(next['active-change'].changeId, null);
  assert.equal(next['development-mode'], 'iteration');
  assert.equal(next.pipeline, null);
});

test('generateProjectConfig writes sparrow-config.json and removes sparrow.json', () => {
  const root = tmpRoot('sparrow-cfg-');
  mkdirSync(join(root, '.sparrow'), { recursive: true });
  writeFileSync(
    join(root, LEGACY_CONFIG_FILE),
    JSON.stringify({ plugins: [{ name: 'archify', version: '1.0.0', enabled: true }] }) + '\n'
  );
  const path = generateProjectConfig({
    projectRoot: root,
    projectName: 'demo',
    version: '0.5.0',
    toolIds: ['cursor'],
  });
  assert.equal(path, join(root, CONFIG_FILE));
  assert.ok(existsSync(join(root, CONFIG_FILE)));
  assert.ok(!existsSync(join(root, LEGACY_CONFIG_FILE)));
  const parsed = JSON.parse(readFileSync(path, 'utf-8'));
  assert.equal(parsed.plugins[0].name, 'archify');
});

test('ensureProjectState does not overwrite existing state; wipeSpecs path resets it', () => {
  const root = tmpRoot('sparrow-init-state-');
  ensureProjectState(root);
  saveProjectState(root, applyDevelopmentMode(loadProjectState(root), 'greenfield'));
  mkdirSync(join(root, CHANGE_CURRENT, 'keep-me'), { recursive: true });
  writeFileSync(join(root, CHANGE_CURRENT, 'keep-me', 'proposal.md'), '# keep\n');

  ensureProjectState(root);
  assert.equal(loadProjectState(root)['development-mode'], 'greenfield');
  assert.ok(existsSync(join(root, CHANGE_CURRENT, 'keep-me', 'proposal.md')));

  wipeSpecTrees(root);
  resetProjectState(root);
  assert.equal(loadProjectState(root)['development-mode'], 'tbd');
  assert.ok(!existsSync(join(root, CHANGE_CURRENT, 'keep-me', 'proposal.md')));
  assert.ok(existsSync(join(root, CHANGE_CURRENT)));
});

test('wipeSpecTrees empties spec dirs but keeps skeleton', () => {
  const root = tmpRoot('sparrow-wipe-');
  mkdirSync(join(root, MASTER_ROOT, 'requirement'), { recursive: true });
  writeFileSync(join(root, MASTER_ROOT, 'requirement', 'prd.md'), 'x\n');
  wipeSpecTrees(root);
  resetProjectState(root);
  assert.deepEqual(JSON.parse(readFileSync(join(root, STATE_FILE), 'utf-8'))['development-mode'], 'tbd');
  assert.ok(existsSync(join(root, MASTER_ROOT)));
  assert.equal(existsSync(join(root, MASTER_ROOT, 'requirement', 'prd.md')), false);
});
