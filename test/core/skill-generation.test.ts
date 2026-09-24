import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SkillRegistry } from '../../src/kernel/skill/registry.js';
import { initializeSkills } from '../../src/cli/agent-skill/initialize-skills.js';
import { generateSkillFiles } from '../../src/cli/agent-skill/generation.js';
import {
  composeSkillBodyFromWorkflow,
  getSparrowSchema,
  uniqueAssetNames,
} from '../../src/kernel/content/skill-composition.js';
import { skillExtras, sharedAssets, sharedReferences, sharedScripts } from '../../src/content/bundled-content.js';

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
  const schema = getSparrowSchema();
  for (const workflow of schema.workflows) {
    const skillMd = join(root, '.cursor/skills', workflow.skillId, 'SKILL.md');
    assert.ok(existsSync(skillMd), `missing ${skillMd}`);
    const text = readFileSync(skillMd, 'utf-8');
    const lines = text.split('\n').length;
    assert.ok(lines < SKILL_MD_LINE_LIMIT, `${workflow.skillId} SKILL.md has ${lines} lines`);
    const harnessIdx = text.lastIndexOf('## 📐 约束资产（Harness）');
    assert.ok(harnessIdx >= 0, `${workflow.skillId} missing harness section`);
    assert.ok(harnessIdx > text.indexOf('## 完成标准') || text.includes('## 完成标准') === false, 'harness should be last major section');
    const lastHeading = [...text.matchAll(/^## .+$/gm)].at(-1)?.[0];
    assert.equal(lastHeading, '## 📐 约束资产（Harness）', `${workflow.skillId} last ## heading is ${lastHeading}`);
  }
});

test('declared share/references/assets/scripts are copied next to SKILL.md', () => {
  const root = generateCursorSkills();
  const schema = getSparrowSchema();
  for (const workflow of schema.workflows) {
    const dir = join(root, '.cursor/skills', workflow.skillId);
    for (const name of workflow.share ?? []) {
      assert.ok(existsSync(join(dir, 'references', name)), `${workflow.skillId} missing share ${name}`);
    }
    for (const name of workflow.references ?? []) {
      assert.ok(existsSync(join(dir, 'references', name)), `${workflow.skillId} missing reference ${name}`);
    }
    for (const name of uniqueAssetNames(workflow)) {
      assert.ok(existsSync(join(dir, 'assets', name)), `${workflow.skillId} missing asset ${name}`);
    }
    for (const name of workflow.scripts ?? []) {
      assert.ok(existsSync(join(dir, 'scripts', name)), `${workflow.skillId} missing script ${name}`);
    }
  }
});

test('schema extras resolve in bundled content', () => {
  const schema = getSparrowSchema();
  for (const workflow of schema.workflows) {
    for (const name of workflow.share ?? []) {
      assert.ok(sharedReferences[name], `shared reference missing: ${name}`);
    }
    for (const name of workflow.references ?? []) {
      assert.ok(skillExtras[workflow.skillId]?.[`references/${name}`], `${workflow.skillId} references/${name}`);
    }
    for (const name of uniqueAssetNames(workflow)) {
      const found = skillExtras[workflow.skillId]?.[`assets/${name}`] ?? sharedAssets[name];
      assert.ok(found, `${workflow.skillId} asset ${name}`);
    }
    for (const name of workflow.scripts ?? []) {
      const found = skillExtras[workflow.skillId]?.[`scripts/${name}`] ?? sharedScripts[name];
      assert.ok(found, `${workflow.skillId} scripts/${name}`);
    }
  }
});

test('output dest paths are declared on each process workflow skill and listed in SKILL.md', () => {
  const schema = getSparrowSchema();
  const processWorkflows = schema.workflows.filter((s) => s.kind === 'process');
  for (const workflow of processWorkflows) {
    assert.ok((workflow.outputs ?? []).length > 0, `${workflow.skillId} missing outputs catalog`);
    const body = [
      composeSkillBodyFromWorkflow(workflow.skillId),
      ...Object.entries(skillExtras[workflow.skillId] ?? {})
        .filter(([rel]) => rel.startsWith('steps/'))
        .map(([, content]) => content),
    ].join('\n');
    for (const output of workflow.outputs ?? []) {
      assert.ok(body.includes(output.dest), `${workflow.skillId} missing dest ${output.dest}`);
    }
  }
});

test('skill routers do not name references or assets up front', () => {
  const root = generateCursorSkills();
  const schema = getSparrowSchema();
  for (const workflow of schema.workflows) {
    const text = readFileSync(join(root, '.cursor/skills', workflow.skillId, 'SKILL.md'), 'utf-8');
    assert.doesNotMatch(text, /references\//, `${workflow.skillId} SKILL.md names references/`);
    assert.doesNotMatch(text, /assets\//, `${workflow.skillId} SKILL.md names assets/`);
    assert.ok(existsSync(join(root, '.cursor/skills', workflow.skillId, 'steps')), `${workflow.skillId} missing steps/`);
  }
  const reqDir = join(root, '.cursor/skills/sparrow-requirement');
  const reqSkill = readFileSync(join(reqDir, 'SKILL.md'), 'utf-8');
  assert.doesNotMatch(reqSkill, /grill-me\.md/);
  assert.doesNotMatch(reqSkill, /assets\/ui-spec\.md/);
  assert.match(reqSkill, /steps\/01-mode\.md/);
  assert.ok(existsSync(join(reqDir, 'steps/01-mode.md')));
  assert.match(readFileSync(join(reqDir, 'steps/06-grill.md'), 'utf-8'), /grill-me\.md/);
  assert.match(readFileSync(join(reqDir, 'steps/09-ui.md'), 'utf-8'), /ui-spec\.md/);
});

test('cursor skills declare AskQuestion and a numbered fallback', () => {
  const root = generateCursorSkills();
  const text = readFileSync(join(root, '.cursor/skills/sparrow-requirement/SKILL.md'), 'utf-8');
  assert.match(text, /AskQuestion/);
  assert.match(text, /分行编号/);
  assert.match(text, /自定义输入/);
  assert.doesNotMatch(text, /请自行判断是否支持光标/);
});

test('slash command is a short pointer, not the full skill body', () => {
  const root = generateCursorSkills();
  const cmd = readFileSync(join(root, '.cursor/commands/sparrow-requirement.md'), 'utf-8');
  assert.match(cmd, /\.cursor\/skills\/sparrow-requirement\/SKILL\.md/);
  assert.doesNotMatch(cmd, /业务服务识别规则/);
  assert.ok(cmd.split('\n').length < 40);
  assert.match(cmd, /包 CLI · ingest/);
});

test('requirement workflow declares ingest as package CLI in schema and SKILL body', () => {
  const workflow = getSparrowSchema().workflows.find((w) => w.skillId === 'sparrow-requirement');
  assert.ok(workflow?.cliCommands?.some((c) => c.id === 'ingest' && c.usage.includes('sparrow ingest')));
  assert.ok((workflow?.harness ?? []).includes('requirement/ingest-cli.md'));
  const body = composeSkillBodyFromWorkflow('sparrow-requirement');
  assert.match(body, /## 包 CLI/);
  assert.match(body, /sparrow ingest <path>/);
});

test('ingest discipline single source ingest-cli.md is referenced consistently', () => {
  const ingestCli = readFileSync(
    join(process.cwd(), 'src/content/harness/requirement/ingest-cli.md'),
    'utf-8',
  );
  assert.match(ingestCli, /禁止.*scripts.*包装 ingest/);
  const requirements = readFileSync(
    join(process.cwd(), 'src/content/harness/requirement/requirements.md'),
    'utf-8',
  );
  const ingestStep = readFileSync(
    join(process.cwd(), 'src/content/workflows/sparrow-requirement/steps/02-input.md'),
    'utf-8',
  );
  for (const doc of [requirements, ingestStep]) {
    assert.match(doc, /ingest-cli\.md/);
  }
  assert.doesNotMatch(requirements, /Python、unzip 手工解 docx/);
});

test('CLI launcher runs TypeScript source instead of a stale esbuild bundle', () => {
  const launcher = readFileSync(join(process.cwd(), 'bin/sparrow.js'), 'utf-8');
  assert.match(launcher, /const srcCli/);
  assert.match(launcher, /register-assets\.mjs/);
  assert.match(launcher, /tsx` is not installed/);
  assert.ok(launcher.length < 4000, 'launcher should not contain bundled skills');
  assert.equal(launcher.includes('createProgress'), false);
});
