import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promoteChangeToMaster, listCurrentChangeIds } from './spec-promote.js';
import { MASTER_ROOT, CHANGE_CURRENT } from './spec-paths.js';

test('promote skips plan.md and writes revision history', () => {
  const root = mkdtempSync(join(tmpdir(), 'sparrow-promote-'));
  const changeId = 'first-ddd';
  const base = join(root, CHANGE_CURRENT, changeId, 'requirement', 'business');
  mkdirSync(base, { recursive: true });
  writeFileSync(join(base, 'prd-business.md'), '# biz\n', 'utf-8');
  const planDir = join(root, CHANGE_CURRENT, changeId, 'design', 'orders');
  mkdirSync(planDir, { recursive: true });
  writeFileSync(join(planDir, 'spec.md'), '# spec\n', 'utf-8');
  writeFileSync(join(planDir, 'plan.md'), '# plan\n', 'utf-8');

  const result = promoteChangeToMaster(root, changeId, '2026-06-06', 'current');
  assert.ok(result.promotedFiles.includes('requirement/business/prd-business.md'));
  assert.ok(result.promotedFiles.includes('design/orders/spec.md'));
  assert.equal(result.promotedFiles.includes('design/orders/plan.md'), false);
  assert.ok(existsSync(join(root, MASTER_ROOT, 'design/orders/spec.md')));
  const hist = readFileSync(join(root, MASTER_ROOT, 'requirement/revision-history.md'), 'utf-8');
  assert.match(hist, /synced-at.*2026-06-06/);
});

test('listCurrentChangeIds', () => {
  const root = mkdtempSync(join(tmpdir(), 'sparrow-list-'));
  mkdirSync(join(root, CHANGE_CURRENT, 'a'), { recursive: true });
  assert.deepEqual(listCurrentChangeIds(root), ['a']);
});
