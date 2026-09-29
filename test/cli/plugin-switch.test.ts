import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeProjectConfig } from '../../src/kernel/runtime/project-config.js';
import { loadBundledPlugins } from '../../src/plugins/load.js';
import { injectAugmentPlugins } from '../../src/cli/agent-skill/plugin-augment.js';
import { generateProjectConfig } from '../../src/cli/agent-skill/generation.js';
import { isPluginEnabled } from '../../src/cli/plugins/plugin-switch.js';

function tmpRoot(): string {
  return mkdtempSync(join(tmpdir(), 'sparrow-plugin-switch-'));
}

test('project plugin switch disables augment injection and keeps the flag', () => {
  loadBundledPlugins();
  const root = tmpRoot();
  try {
    writeProjectConfig(root, {
      plugins: [{ name: 'sparrow-ui', version: '2.13.0', enabled: false }],
    });
    assert.equal(isPluginEnabled(root, 'sparrow-ui'), false);
    assert.equal(isPluginEnabled(root, 'archify'), true);

    const disabled = injectAugmentPlugins('{{PLUGIN:sparrow-ui}}', 'sparrow-requirement', root);
    assert.equal(disabled.includes('{{PLUGIN:sparrow-ui}}'), false);
    assert.equal(disabled.includes('UI/UX Pro Max'), false);

    const enabled = injectAugmentPlugins('{{PLUGIN:archify}}', 'sparrow-architecture', root);
    assert.match(enabled, /archify/i);

    const configPath = generateProjectConfig({
      projectRoot: root,
      projectName: 'demo',
      version: '0.6.0',
      toolIds: ['cursor'],
    });
    const saved = JSON.parse(readFileSync(configPath, 'utf-8')) as {
      plugins: { name: string; enabled: boolean }[];
    };
    assert.equal(saved.plugins.find((plugin) => plugin.name === 'sparrow-ui')?.enabled, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
