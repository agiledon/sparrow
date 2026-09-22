import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SkillRegistry } from './skills.js';
import { initializeSkills } from '../skills/index.js';
import { generateSkillFiles } from './skill-generation.js';
import { getWorkflowSchema, uniqueAssetNames } from './workflow-schema/index.js';
import { skillExtras, sharedAssets, sharedReferences, sharedScripts, skillTemplates } from '../schemas/bundled-content.js';

const SKILL_MD_LINE_LIMIT = 500;

function generateCursorSkills() {
  const root = mkdtempSync(join(tmpdir(), 'sparrow-skills-'));
  const registry = new SkillRegistry();
  initializeSkills(registry);
  generateSkillFiles(root, ['cursor'], registry);
  return root;
}

test('generated skills are directories with SKILL.md under the line limit', () => {
  const root = generateCursorSkills();
  const schema = getWorkflowSchema();
  for (const step of schema.steps) {
    const skillMd = join(root, '.cursor/skills', step.skillId, 'SKILL.md');
    assert.ok(existsSync(skillMd), `missing ${skillMd}`);
    const text = readFileSync(skillMd, 'utf-8');
    const lines = text.split('\n').length;
    assert.ok(lines < SKILL_MD_LINE_LIMIT, `${step.skillId} SKILL.md has ${lines} lines`);
    const harnessIdx = text.lastIndexOf('## 📐 约束资产（Harness）');
    assert.ok(harnessIdx >= 0, `${step.skillId} missing harness section`);
    assert.ok(harnessIdx > text.indexOf('## 完成标准') || text.includes('## 完成标准') === false, 'harness should be last major section');
    const lastHeading = [...text.matchAll(/^## .+$/gm)].at(-1)?.[0];
    assert.equal(lastHeading, '## 📐 约束资产（Harness）', `${step.skillId} last ## heading is ${lastHeading}`);
  }
});

test('declared share/references/assets/scripts are copied next to SKILL.md', () => {
  const root = generateCursorSkills();
  const schema = getWorkflowSchema();
  for (const step of schema.steps) {
    const dir = join(root, '.cursor/skills', step.skillId);
    for (const name of step.share ?? []) {
      assert.ok(existsSync(join(dir, 'references', name)), `${step.skillId} missing share ${name}`);
    }
    for (const name of step.references ?? []) {
      assert.ok(existsSync(join(dir, 'references', name)), `${step.skillId} missing reference ${name}`);
    }
    for (const name of uniqueAssetNames(step)) {
      assert.ok(existsSync(join(dir, 'assets', name)), `${step.skillId} missing asset ${name}`);
    }
    for (const name of step.scripts ?? []) {
      assert.ok(existsSync(join(dir, 'scripts', name)), `${step.skillId} missing script ${name}`);
    }
  }
});

test('schema extras resolve in bundled content', () => {
  const schema = getWorkflowSchema();
  for (const step of schema.steps) {
    for (const name of step.share ?? []) {
      assert.ok(sharedReferences[name], `shared reference missing: ${name}`);
    }
    for (const name of step.references ?? []) {
      assert.ok(skillExtras[step.skillId]?.[`references/${name}`], `${step.skillId} references/${name}`);
    }
    for (const name of uniqueAssetNames(step)) {
      const found = skillExtras[step.skillId]?.[`assets/${name}`] ?? sharedAssets[name];
      assert.ok(found, `${step.skillId} asset ${name}`);
    }
    for (const name of step.scripts ?? []) {
      const found = skillExtras[step.skillId]?.[`scripts/${name}`] ?? sharedScripts[name];
      assert.ok(found, `${step.skillId} scripts/${name}`);
    }
  }
});

test('output dest paths are declared on each core skill and listed in SKILL.md', () => {
  const schema = getWorkflowSchema();
  const core = schema.steps.filter((s) => s.kind === 'core');
  for (const step of core) {
    assert.ok((step.outputs ?? []).length > 0, `${step.skillId} missing outputs catalog`);
    const body = skillTemplates[step.template];
    assert.ok(body, `missing template ${step.template}`);
    for (const output of step.outputs ?? []) {
      assert.ok(body.includes(output.dest), `${step.skillId} SKILL.md missing dest ${output.dest}`);
    }
  }
});

test('slash command is a short pointer, not the full skill body', () => {
  const root = generateCursorSkills();
  const cmd = readFileSync(join(root, '.cursor/commands/sparrow-requirement.md'), 'utf-8');
  assert.match(cmd, /\.cursor\/skills\/sparrow-requirement\/SKILL\.md/);
  assert.doesNotMatch(cmd, /业务服务识别规则/);
  assert.ok(cmd.split('\n').length < 40);
});

test('CLI launcher runs TypeScript source instead of a stale esbuild bundle', () => {
  const launcher = readFileSync(join(process.cwd(), 'bin/sparrow.js'), 'utf-8');
  assert.match(launcher, /const srcCli/);
  assert.match(launcher, /register-assets\.mjs/);
  assert.match(launcher, /tsx` is not installed/);
  assert.ok(launcher.length < 4000, 'launcher should not contain bundled skills');
  assert.equal(launcher.includes('createProgress'), false);
});
