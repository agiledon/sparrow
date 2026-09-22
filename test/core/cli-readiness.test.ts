import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { probeSparrowCli, recordCliReadiness, CLI_READINESS_REL } from '../../src/core/cli-readiness.js';

test('probeSparrowCli records failure when sparrow is not on PATH', () => {
  const spawn = () => ({ status: 1, stdout: '', stderr: '' }) as ReturnType<typeof import('node:child_process').spawnSync>;
  const root = mkdtempSync(join(tmpdir(), 'cli-ready-'));
  const r = probeSparrowCli(root, spawn);
  assert.equal(r.ok, false);
  assert.match(r.hint, /Sparrow CLI not detected/);
});

test('probeSparrowCli prefers sparrow on PATH', () => {
  const spawn = (cmd: string, args: string[]) => {
    if (cmd === 'sparrow' && args[0] === '--version') {
      return { status: 0, stdout: '0.6.0\n', stderr: '' };
    }
    return { status: 1, stdout: '', stderr: '' };
  };
  const r = probeSparrowCli('/tmp', spawn as typeof import('node:child_process').spawnSync);
  assert.equal(r.ok, true);
  assert.equal(r.version, '0.6.0');
  assert.equal(r.method, 'path');
});

test('recordCliReadiness writes JSON under .sparrow', () => {
  const root = mkdtempSync(join(tmpdir(), 'cli-ready-'));
  const spawn = (cmd: string, args: string[]) => {
    if (cmd === 'sparrow' && args[0] === '--version') {
      return { status: 0, stdout: '1.0.0\n', stderr: '' };
    }
    return { status: 1, stdout: '', stderr: '' };
  };
  const { path, readiness } = recordCliReadiness(root, spawn as typeof import('node:child_process').spawnSync);
  assert.equal(readiness.ok, true);
  assert.ok(existsSync(path));
  assert.equal(path, join(root, CLI_READINESS_REL));
  const onDisk = JSON.parse(readFileSync(path, 'utf8')) as { ok: boolean; version: string };
  assert.equal(onDisk.ok, true);
  assert.equal(onDisk.version, '1.0.0');
});
