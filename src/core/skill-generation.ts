/**
 * Skill generation engine.
 *
 * Assembles skill markdown from templates, injects prerequisite checks,
 * output path configuration, and next-step hints. Generates per-tool
 * formatted files via the adapter registry.
 */

import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { SPARROW_DIR } from './spec-paths.js';
import { readProjectConfig, writeProjectConfig } from './project-config.js';
import type { SkillDefinition, SkillRegistry } from './skills.js';
import { getAdapter } from './adapters/index.js';
import type { CommandContent, ToolCommandAdapter } from './adapters/types.js';
import {
  getWorkflowSchema,
  getWorkflowStepBySkillId,
  lookupSharedAsset,
  lookupSharedReference,
  lookupSharedScript,
  lookupSkillExtra,
  uniqueAssetNames,
} from './workflow-schema/index.js';
import { HARNESS_TOKEN } from './skill-tokens.js';

import { getBundledPlugins } from '../plugins/index.js';
import type { Plugin } from '../plugins/types.js';
import { buildPluginSkillBody } from './plugin-generation.js';

export { HARNESS_TOKEN } from './skill-tokens.js';

/** Token pattern for augment plugin injection: {{PLUGIN:<pluginId>}} */
const PLUGIN_TOKEN_RE = /\{\{PLUGIN:([\w-]+)\}\}/g;

function injectAugmentPlugins(body: string, skillId: string): string {
  return body.replace(PLUGIN_TOKEN_RE, (match, pluginId) => {
    const plugin = getBundledPlugins().find((p) => p.manifest.name === pluginId);
    if (!plugin) return match;

    const augment = plugin.manifest.contributes.augments?.find(
      (a) => a.targetSkill === skillId
    );
    if (!augment) return match;

    const key = augment.contentFile || 'SKILL.md';
    const content = plugin.augmentContents[key] || plugin.skillContent;
    return content ? '\n\n---\n\n' + content + '\n' : match;
  });
}

/**
 * Build the harness reference section for a skill.
 * Project-level constraints take precedence over global ones.
 */
function buildHarnessSection(adapter: ToolCommandAdapter, skillId: string, registry: SkillRegistry): string {
  const relPaths = registry.getHarness(skillId);
  const conditional = getWorkflowSchema().globalHarness?.conditional ?? [];
  if (relPaths.length === 0 && conditional.length === 0) return '';

  const lines = [
    '---',
    '',
    '## 📐 约束资产（Harness）',
    '',
    '执行本阶段前，**必须先加载**以下约束资产并严格遵守。它们定义了本阶段**必须遵守 / 禁止**的 DDD 纪律。',
    '',
    '**优先级**：项目级约束 > 全局级约束。内容冲突时以项目级为准；项目级文件不存在时直接使用全局级。',
    '',
  ];
  if (relPaths.length > 0) {
    lines.push('### 始终加载（always）', '');
    for (const relPath of relPaths) {
      lines.push(adapter.formatHarnessRef(relPath, 'project'));
      lines.push(adapter.formatHarnessRef(relPath, 'global'));
    }
    lines.push('');
  }
  if (conditional.length > 0) {
    lines.push('### 条件加载（conditional）', '');
    lines.push('满足条件时**必须额外加载**：', '');
    for (const entry of conditional) {
      lines.push(`- \`${entry.path}\` — 当 ${entry.when}`);
      lines.push(adapter.formatHarnessRef(entry.path, 'project'));
      lines.push(adapter.formatHarnessRef(entry.path, 'global'));
      lines.push('');
    }
  }
  return lines.join('\n');
}

/** Skill ids removed in prior releases; cleaned up on regenerate. */
const DEPRECATED_SKILL_IDS = [
  'sparrow-explore',
  'sparrow-harness',
  'sparrow-helper-sync',
  'sparrow-helper-harness',
  'sparrow-helper-reconcile',
  'sparrow-helper-archive',
  'sparrow-supporting-archive',
];

function removeDeprecatedSkillFiles(projectRoot: string, toolIds: string[]): void {
  for (const toolId of toolIds) {
    const adapter = getAdapter(toolId);
    for (const skillId of DEPRECATED_SKILL_IDS) {
      const skillPath = join(projectRoot, adapter.getSkillPath(skillId));
      const skillDir = dirname(skillPath);
      if (existsSync(skillDir)) {
        rmSync(skillDir, { recursive: true, force: true });
      }
      const commandRelPath = adapter.getCommandPath(skillId);
      if (commandRelPath !== null) {
        const commandPath = join(projectRoot, commandRelPath);
        if (existsSync(commandPath)) {
          rmSync(commandPath, { force: true });
        }
      }
    }
  }
}

/**
 * Assemble the complete CommandContent for a skill.
 */
export function assembleSkillContent(skill: SkillDefinition, registry: SkillRegistry): CommandContent {
  const templateFn = registry.getTemplate(skill.id);
  if (!templateFn) {
    throw new Error(`No template registered for skill: ${skill.id}`);
  }

  const body = templateFn();

  const step = getWorkflowStepBySkillId(skill.id);
  const packageCliLines =
    step?.cliCommands?.map((c) => {
      const note = c.note ? ` (${c.note})` : '';
      return `包 CLI · ${c.id}：\`${c.usage}\`${note} — 勿用 skill/scripts 包装。`;
    }) ?? [];

  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    tags: ['sparrow', 'ddd', skill.kind, skill.phase === 'product' ? 'product-level' : 'team-level'],
    body,
    ...(packageCliLines.length > 0 ? { packageCliLines } : {}),
  };
}

export function registerPluginSkillTemplates(plugins: Plugin[], registry: SkillRegistry): void {
  for (const p of plugins) {
    const skills = p.manifest.contributes.skills || [];
    for (const skill of skills) {
      registry.registerTemplate(skill.id, () => buildPluginSkillBody(skill, p));
    }
  }
}

function writeBundleFile(absPath: string, content: string): void {
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, content.endsWith('\n') ? content : `${content}\n`, 'utf-8');
}

function writeSkillExtras(projectRoot: string, skillDirRel: string, skillId: string): string[] {
  const step = getWorkflowStepBySkillId(skillId);
  if (!step) return [];
  const created: string[] = [];
  const skillDir = join(projectRoot, skillDirRel);

  for (const name of step.share ?? []) {
    const body = lookupSharedReference(name);
    if (body === undefined) {
      throw new Error(`Missing shared reference '${name}' for skill ${skillId}`);
    }
    const rel = join(skillDirRel, 'references', name);
    writeBundleFile(join(skillDir, 'references', name), body);
    created.push(rel);
  }

  for (const name of step.references ?? []) {
    const body = lookupSkillExtra(skillId, `references/${name}`);
    if (body === undefined) {
      throw new Error(`Missing references/${name} for skill ${skillId}`);
    }
    const rel = join(skillDirRel, 'references', name);
    writeBundleFile(join(skillDir, 'references', name), body);
    created.push(rel);
  }

  for (const name of uniqueAssetNames(step)) {
    const body = lookupSkillExtra(skillId, `assets/${name}`) ?? lookupSharedAsset(name);
    if (body === undefined) {
      throw new Error(`Missing asset '${name}' for skill ${skillId}`);
    }
    const rel = join(skillDirRel, 'assets', name);
    writeBundleFile(join(skillDir, 'assets', name), body);
    created.push(rel);
  }

  for (const name of step.scripts ?? []) {
    const body = lookupSkillExtra(skillId, `scripts/${name}`) ?? lookupSharedScript(name);
    if (body === undefined) {
      throw new Error(`Missing scripts/${name} for skill ${skillId}`);
    }
    const rel = join(skillDirRel, 'scripts', name);
    writeBundleFile(join(skillDir, 'scripts', name), body);
    created.push(rel);
  }

  return created;
}

/**
 * Generate skill and command files for a list of tool ids.
 *
 * @param projectRoot - Absolute path to the project root
 * @param toolIds - List of tool ids to generate files for
 * @returns Summary of created files
 */
export function generateSkillFiles(
  projectRoot: string,
  toolIds: string[],
  registry: SkillRegistry
): { toolId: string; files: string[] }[] {
  const skills = registry.getOrderedSkills();
  const results: { toolId: string; files: string[] }[] = [];

  for (const toolId of toolIds) {
    const adapter = getAdapter(toolId);
    const createdFiles: string[] = [];

    for (const skill of skills) {
      const content = assembleSkillContent(skill, registry);

      const harnessSection = buildHarnessSection(adapter, skill.id, registry);
      if (content.body.includes(HARNESS_TOKEN)) {
        content.body = content.body.replace(HARNESS_TOKEN, harnessSection);
      } else if (harnessSection) {
        content.body = `${content.body}\n${harnessSection}`;
      }

      content.body = injectAugmentPlugins(content.body, skill.id);

      const skillRelPath = adapter.getSkillPath(skill.id);
      content.skillRelPath = skillRelPath;
      const skillPath = join(projectRoot, skillRelPath);
      mkdirSync(dirname(skillPath), { recursive: true });
      writeFileSync(skillPath, adapter.formatSkill(content), 'utf-8');
      createdFiles.push(skillRelPath);
      createdFiles.push(...writeSkillExtras(projectRoot, dirname(skillRelPath), skill.id));

      const commandRelPath = adapter.getCommandPath(skill.id);
      if (commandRelPath !== null) {
        const commandPath = join(projectRoot, commandRelPath);
        mkdirSync(dirname(commandPath), { recursive: true });
        writeFileSync(commandPath, adapter.formatCommand(content), 'utf-8');
        createdFiles.push(commandRelPath);
      }
    }

    results.push({ toolId, files: createdFiles });
  }

  removeDeprecatedSkillFiles(projectRoot, toolIds);

  return results;
}

export { SPARROW_DIR };

export interface ProjectContext {
  projectRoot: string;
  projectName: string;
  version: string;
  toolIds: string[];
  /** BCP 47 document language. Defaults to zh-Hans when omitted. */
  lang?: string;
}

/**
 * Generate sparrow-config.json under .sparrow/ (migrates leftover sparrow.json).
 */
export function generateProjectConfig(ctx: ProjectContext): string {
  const { projectRoot, projectName, version, toolIds } = ctx;
  const existing = readProjectConfig(projectRoot);
  const existingPlugins = Array.isArray(existing.plugins) ? existing.plugins : [];
  const lang =
    ctx.lang ??
    (typeof existing.lang === 'string' && existing.lang ? existing.lang : 'zh-Hans');

  const config = {
    version,
    tools: toolIds,
    projectName,
    lang,
    createdAt: typeof existing.createdAt === 'string' ? existing.createdAt : new Date().toISOString(),
    outputBase: 'docs/sparrow',
    codeBase: 'backend',
    frontendBase: 'frontend',
    ...(existingPlugins.length > 0 ? { plugins: existingPlugins } : {}),
  };

  return writeProjectConfig(projectRoot, config);
}
