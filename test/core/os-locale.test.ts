import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_LANG,
  detectOsLocale,
  isValidLang,
  normalizeLocale,
  resolveInitLang,
} from '../../src/core/os-locale.js';

test('normalizeLocale maps OS strings to BCP 47', () => {
  assert.equal(normalizeLocale('zh-Hans-CN'), 'zh-Hans');
  assert.equal(normalizeLocale('("zh-Hans-CN", "en-US")'), 'zh-Hans');
  assert.equal(normalizeLocale('zh-CN'), 'zh-Hans');
  assert.equal(normalizeLocale('zh_SG.UTF-8'), 'zh-Hans');
  assert.equal(normalizeLocale('zh-Hant-TW'), 'zh-Hant');
  assert.equal(normalizeLocale('zh_TW.UTF-8'), 'zh-Hant');
  assert.equal(normalizeLocale('zh-HK'), 'zh-Hant');
  assert.equal(normalizeLocale('en-US'), 'en');
  assert.equal(normalizeLocale('en_GB.UTF-8'), 'en');
  assert.equal(normalizeLocale('ja-JP'), 'ja');
  assert.equal(normalizeLocale('C'), null);
  assert.equal(normalizeLocale(''), null);
});

test('detectOsLocale uses the reader for each platform and falls back on throw', () => {
  assert.equal(
    detectOsLocale({ platform: 'darwin', read: () => 'zh-Hans-CN' }),
    'zh-Hans',
  );
  assert.equal(
    detectOsLocale({ platform: 'win32', read: () => 'zh-CN' }),
    'zh-Hans',
  );
  assert.equal(
    detectOsLocale({ platform: 'linux', read: () => 'en_US.UTF-8' }),
    'en',
  );
  assert.equal(
    detectOsLocale({
      platform: 'linux',
      read: () => {
        throw new Error('missing');
      },
    }),
    null,
  );
  assert.equal(detectOsLocale({ platform: 'aix', read: () => 'en' }), null);
});

test('resolveInitLang prefers --lang, then existing, then detection, then zh-Hans', () => {
  assert.equal(resolveInitLang({ explicit: 'en', existing: 'zh-Hans', detected: 'ja' }), 'en');
  assert.equal(resolveInitLang({ existing: 'zh-Hant', detected: 'en' }), 'zh-Hant');
  assert.equal(resolveInitLang({ detected: 'ja' }), 'ja');
  assert.equal(resolveInitLang({ detected: null }), DEFAULT_LANG);
  assert.equal(isValidLang('zh-Hans'), true);
  assert.throws(() => resolveInitLang({ explicit: 'not a lang' }), /Invalid --lang/);
});
