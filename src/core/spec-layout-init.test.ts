import { mkdtempSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeSpecLayout } from './spec-layout-init.js';
import {
  ACTIVE_CHANGE_FILE,
  MASTER_ROOT,
  CHANGE_ROOT,
  CHANGE_CURRENT,
  CHANGE_ARCHIVE,
  SPARROW_DOCS,
} from './spec-paths.js';

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
  assert.ok(existsSync(join(root, ACTIVE_CHANGE_FILE)));
  assert.ok(existsSync(join(root, SPARROW_DOCS, 'README.md')));
});
