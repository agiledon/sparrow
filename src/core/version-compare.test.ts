import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareVersions } from './version-compare.js';

test('相同版本 → false', () => {
  assert.equal(compareVersions('0.3.1', '0.3.1'), false);
});

test('补丁更新 → true', () => {
  assert.equal(compareVersions('0.3.0', '0.3.1'), true);
});

test('次版本更新 → true', () => {
  assert.equal(compareVersions('0.2.0', '0.3.0'), true);
});

test('主版本更新 → true', () => {
  assert.equal(compareVersions('1.0.0', '2.0.0'), true);
});

test('本地更新 → false', () => {
  assert.equal(compareVersions('0.4.0', '0.3.1'), false);
});
