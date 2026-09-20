import { mkdtempSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeSpecLayout } from './spec-layout-init.js';
import {
  MASTER_ROOT,
  CHANGE_ROOT,
  CHANGE_CURRENT,
  CHANGE_ARCHIVE,
  SPARROW_DOCS,
  STATE_FILE,
} from './spec-paths.js';
import { ensureProjectState } from './project-state.js';

function listImmediate(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).sort();
}

function isEmptyDir(dir: string): boolean {
  return existsSync(dir) && statSync(dir).isDirectory() && listImmediate(dir).length === 0;
}

test('init spec layout creates empty master, change/current, and change/archive', () => {
  const root = mkdtempSync(join(tmpdir(), 'sparrow-layout-'));
  initializeSpecLayout(root);

  assert.ok(isEmptyDir(join(root, MASTER_ROOT)));
  assert.deepEqual(listImmediate(join(root, CHANGE_ROOT)), ['archive', 'current']);
  assert.ok(isEmptyDir(join(root, CHANGE_CURRENT)));
  assert.ok(isEmptyDir(join(root, CHANGE_ARCHIVE)));
  ensureProjectState(root);
  assert.ok(existsSync(join(root, STATE_FILE)));
  assert.ok(existsSync(join(root, SPARROW_DOCS, 'README.md')));
});
