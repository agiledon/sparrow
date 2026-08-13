import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isExecSyncTimeoutError } from './exec-errors.js';

test('status null + signal SIGTERM → true', () => {
  const e = Object.assign(new Error('timed out'), { status: null, signal: 'SIGTERM' });
  assert.equal(isExecSyncTimeoutError(e), true);
});

test('普通 Error → false', () => {
  assert.equal(isExecSyncTimeoutError(new Error('boom')), false);
});

test('非 Error → false', () => {
  assert.equal(isExecSyncTimeoutError('boom'), false);
});
