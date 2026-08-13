import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readPackageVersion } from './package-version.js';

test('读取存在的 package.json 版本', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sparrow-pkg-'));
  try {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x', version: '1.2.3' }));
    assert.equal(readPackageVersion(join(dir, 'package.json')), '1.2.3');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('缺失 package.json 抛错', () => {
  assert.throws(() => readPackageVersion(join(tmpdir(), 'no-such-dir', 'package.json')));
});
