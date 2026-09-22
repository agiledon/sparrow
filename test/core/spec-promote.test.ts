import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promoteChangeToMaster, listCurrentChangeIds, classifyPromoteGroup, computeDeltas } from '../../src/kernel/runtime/spec-promote.js';
import { MASTER_ROOT, CHANGE_CURRENT } from '../../src/kernel/runtime/spec-paths.js';

function seedChange(root: string, changeId: string): string {
  const base = join(root, CHANGE_CURRENT, changeId);
  mkdirSync(join(base, 'requirement', 'business', 'services'), { recursive: true });
  writeFileSync(join(base, 'requirement', 'business', 'catalog.md'), '# catalog\n', 'utf-8');
  writeFileSync(join(base, 'requirement', 'business', 'services', 'BS-submit-order.md'), '# svc\n', 'utf-8');
  mkdirSync(join(base, 'architecture'), { recursive: true });
  writeFileSync(join(base, 'architecture', 'bounded-contexts.md'), '# bc\n', 'utf-8');
  const planDir = join(base, 'design', 'orders');
  mkdirSync(planDir, { recursive: true });
  writeFileSync(join(planDir, 'spec.md'), '# spec\n', 'utf-8');
  writeFileSync(join(planDir, 'plan.md'), '# plan\n', 'utf-8');
  return base;
}

test('promote ADDED creates master files and skips plan.md', () => {
  const root = mkdtempSync(join(tmpdir(), 'sparrow-promote-'));
  const changeId = 'first-ddd';
  seedChange(root, changeId);

  const result = promoteChangeToMaster(root, changeId, '2026-06-06', { source: 'current' });
  assert.ok(result.promotedFiles.includes('requirement/business/catalog.md'));
  assert.ok(result.promotedFiles.includes('architecture/bounded-contexts.md'));
  assert.ok(result.promotedFiles.includes('design/orders/spec.md'));
  assert.equal(result.promotedFiles.includes('design/orders/plan.md'), false);
  assert.ok(existsSync(join(root, MASTER_ROOT, 'design/orders/spec.md')));
  assert.ok(result.deltas.some((d) => d.path === 'design/orders/spec.md' && d.kind === 'ADDED' && d.slug === 'orders'));
  assert.ok(result.deltas.some((d) => d.path === 'requirement/business/catalog.md' && d.kind === 'ADDED' && d.slug === 'shared'));
  const hist = readFileSync(join(root, MASTER_ROOT, 'requirement/revision-history.md'), 'utf-8');
  assert.match(hist, /synced-at.*2026-06-06/);
  assert.match(hist, /### shared/);
  assert.match(hist, /ADDED:.*catalog\.md/);
  const designHist = readFileSync(join(root, MASTER_ROOT, 'design/revision-history.md'), 'utf-8');
  assert.match(designHist, /### slug: orders/);
});

test('promote MODIFIED appends delta block and keeps original body', () => {
  const root = mkdtempSync(join(tmpdir(), 'sparrow-promote-mod-'));
  const changeId = 'iter-2';
  seedChange(root, changeId);
  promoteChangeToMaster(root, changeId, '2026-06-01', { source: 'current' });

  const masterSpec = join(root, MASTER_ROOT, 'design/orders/spec.md');
  const original = readFileSync(masterSpec, 'utf-8');
  writeFileSync(join(root, CHANGE_CURRENT, changeId, 'design/orders/spec.md'), '# spec v2\nnew line\n', 'utf-8');

  const result = promoteChangeToMaster(root, changeId, '2026-06-10', { source: 'current' });
  const after = readFileSync(masterSpec, 'utf-8');
  assert.ok(after.includes('# spec'));
  assert.ok(after.includes('Delta — iter-2'));
  assert.ok(after.includes('MODIFIED'));
  assert.ok(after.includes('# spec v2'));
  assert.ok(after.length > original.length);
  assert.ok(result.deltas.some((d) => d.path === 'design/orders/spec.md' && d.kind === 'MODIFIED'));
});

test('promote REMOVED records history only and keeps master file', () => {
  const root = mkdtempSync(join(tmpdir(), 'sparrow-promote-rm-'));
  const changeId = 'iter-3';
  const base = seedChange(root, changeId);
  writeFileSync(join(base, 'design/orders/api.md'), '# api\n', 'utf-8');
  promoteChangeToMaster(root, changeId, '2026-06-01', { source: 'current' });

  unlinkSync(join(base, 'design/orders/api.md'));

  const result = promoteChangeToMaster(root, changeId, '2026-06-15', { source: 'current' });
  assert.ok(existsSync(join(root, MASTER_ROOT, 'design/orders/api.md')));
  assert.ok(result.deltas.some((d) => d.path === 'design/orders/api.md' && d.kind === 'REMOVED' && d.slug === 'orders'));
  const designHist = readFileSync(join(root, MASTER_ROOT, 'design/revision-history.md'), 'utf-8');
  assert.match(designHist, /REMOVED:.*design\/orders\/api\.md/);
});

test('slugAllowlist skips non-allowlisted design slugs', () => {
  const root = mkdtempSync(join(tmpdir(), 'sparrow-promote-allow-'));
  const changeId = 'partial';
  const base = seedChange(root, changeId);
  mkdirSync(join(base, 'design', 'payments'), { recursive: true });
  writeFileSync(join(base, 'design/payments/spec.md'), '# pay\n', 'utf-8');

  const result = promoteChangeToMaster(root, changeId, '2026-06-20', {
    source: 'current',
    slugAllowlist: ['orders'],
  });
  assert.ok(existsSync(join(root, MASTER_ROOT, 'design/orders/spec.md')));
  assert.equal(existsSync(join(root, MASTER_ROOT, 'design/payments/spec.md')), false);
  assert.ok(result.deltas.every((d) => d.slug === 'shared' || d.slug === 'orders'));
  assert.ok(result.promotedFiles.includes('requirement/business/catalog.md'));
});

test('classifyPromoteGroup', () => {
  assert.equal(classifyPromoteGroup('design/orders/spec.md'), 'orders');
  assert.equal(classifyPromoteGroup('requirement/business/catalog.md'), 'shared');
  assert.equal(classifyPromoteGroup('architecture/bounded-contexts.md'), 'shared');
});

test('computeDeltas is pure: ADDED MODIFIED REMOVED without filesystem', () => {
  const sourceRels = ['requirement/a.md', 'design/orders/spec.md'];
  const masterRels = ['requirement/a.md', 'design/orders/spec.md', 'design/orders/api.md'];
  const sourceTexts = {
    'requirement/a.md': '# a\n',
    'design/orders/spec.md': '# spec v2\n',
  };
  const masterTexts = {
    'requirement/a.md': '# a\n',
    'design/orders/spec.md': '# spec\n',
    'design/orders/api.md': '# api\n',
  };
  const { deltas, writePlan } = computeDeltas(sourceTexts, masterTexts, sourceRels, masterRels);
  assert.ok(deltas.some((d) => d.path === 'design/orders/spec.md' && d.kind === 'MODIFIED'));
  assert.ok(deltas.some((d) => d.path === 'design/orders/api.md' && d.kind === 'REMOVED'));
  assert.equal(
    deltas.some((d) => d.path === 'requirement/a.md'),
    false
  );
  assert.ok(writePlan.some((w) => w.path === 'design/orders/spec.md' && w.kind === 'MODIFIED'));
  assert.equal(
    writePlan.some((w) => w.path === 'design/orders/api.md'),
    false
  );
});

test('listCurrentChangeIds', () => {
  const root = mkdtempSync(join(tmpdir(), 'sparrow-list-'));
  mkdirSync(join(root, CHANGE_CURRENT, 'a'), { recursive: true });
  assert.deepEqual(listCurrentChangeIds(root), ['a']);
});
