/**
 * Skill generation engine.
 *
 * Assembles skill markdown from templates, injects prerequisite checks,
 * output path configuration, and next-step hints. Generates per-tool
 * formatted files via the adapter registry.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { SkillDefinition } from './config.js';
import { getOrderedSkills } from './config.js';
import { getAdapter } from './adapters/index.js';
import type { CommandContent, ToolCommandAdapter } from './adapters/types.js';
import { generateProjectMdContent } from './project-md.js';

/**
 * Harness asset mapped to each stage skill.
 * The harness defines the "must / must not" DDD discipline for the stage.
 */
const SKILL_HARNESS_MAP: Record<string, string[]> = {
  'sparrow-explore': ['explore/requirements.md'],
  'sparrow-arch': ['arch/business.md', 'arch/application.md', 'arch/frontend.md'],
  'sparrow-design': ['design/api-design.md'],
  'sparrow-model': ['model/architecture.md', 'model/domain-modeling.md', 'model/view-modeling.md'],
  'sparrow-plan': [],
  'sparrow-apply': ['apply/implementation.md'],
  'sparrow-archive': [],
};

import { getBundledPlugins } from '../plugins/index.js';
import type { Plugin } from '../plugins/types.js';
import { buildPluginSkillBody } from './plugin-generation.js';

/** Token in skill bodies where the harness reference section is injected. */
export const HARNESS_TOKEN = '{{HARNESS}}';

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
function buildHarnessSection(adapter: ToolCommandAdapter, skillId: string): string {
  const relPaths = SKILL_HARNESS_MAP[skillId] || [];
  if (relPaths.length === 0) return '';

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
  for (const relPath of relPaths) {
    lines.push(adapter.formatHarnessRef(relPath, 'project'));
    lines.push(adapter.formatHarnessRef(relPath, 'global'));
  }
  lines.push('');
  return lines.join('\n');
}

/**
 * Skill template function type.
 * Each skill module exports a function that returns the full markdown body.
 */
export type SkillTemplateFn = () => string;

/**
 * Registry mapping skill ids to their template functions.
 */
const skillTemplateRegistry = new Map<string, SkillTemplateFn>();

/**
 * Register a skill template.
 */
export function registerSkillTemplate(skillId: string, templateFn: SkillTemplateFn): void {
  skillTemplateRegistry.set(skillId, templateFn);
}

/**
 * Get a registered skill template.
 */
export function getSkillTemplate(skillId: string): SkillTemplateFn | undefined {
  return skillTemplateRegistry.get(skillId);
}

/**
 * Assemble the complete CommandContent for a skill.
 */
export function assembleSkillContent(skill: SkillDefinition): CommandContent {
  const templateFn = skillTemplateRegistry.get(skill.id);
  if (!templateFn) {
    throw new Error(`No template registered for skill: ${skill.id}`);
  }

  const body = templateFn();

  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    tags: ['sparrow', 'ddd', skill.phase === 'product' ? 'product-level' : 'team-level'],
    body,
  };
}

export function registerPluginSkillTemplates(plugins: Plugin[]): void {
  for (const p of plugins) {
    const skills = p.manifest.contributes.skills || [];
    for (const skill of skills) {
      registerSkillTemplate(skill.id, () => buildPluginSkillBody(skill, p));
    }
  }
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
  toolIds: string[]
): { toolId: string; files: string[] }[] {
  const skills = getOrderedSkills();
  const results: { toolId: string; files: string[] }[] = [];

  for (const toolId of toolIds) {
    const adapter = getAdapter(toolId);
    const createdFiles: string[] = [];

    for (const skill of skills) {
      const content = assembleSkillContent(skill);

      // Inject the harness reference section (project + global constraint assets)
      const harnessSection = buildHarnessSection(adapter, skill.id);
      if (harnessSection) {
        content.body = content.body.includes(HARNESS_TOKEN)
          ? content.body.replace(HARNESS_TOKEN, harnessSection)
          : content.body + '\n' + harnessSection;
      }

      // Inject augment plugins ({{PLUGIN:archify}} etc.)
      content.body = injectAugmentPlugins(content.body, skill.id);

      // Generate skill file
      const skillPath = join(projectRoot, adapter.getSkillPath(skill.id));
      mkdirSync(join(skillPath, '..'), { recursive: true });
      writeFileSync(skillPath, adapter.formatSkill(content), 'utf-8');
      createdFiles.push(adapter.getSkillPath(skill.id));

      // Generate command file (skip if tool discovers commands from skills directory)
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

  return results;
}

/**
 * Sparrow configuration directory (hidden).
 * All framework config files live under .sparrow/ in the project root.
 */
export const SPARROW_DIR = '.sparrow';

export interface ProjectContext {
  projectRoot: string;
  projectName: string;
  version: string;
  toolIds: string[];
}

/**
 * Generate a sparrow.json config file under .sparrow/ in the project root.
 */
export function generateProjectConfig(ctx: ProjectContext): string {
  const { projectRoot, projectName, version, toolIds } = ctx;
  let existingPlugins: unknown[] = [];
  try {
    const existing = JSON.parse(readFileSync(join(projectRoot, SPARROW_DIR, 'sparrow.json'), 'utf-8'));
    if (Array.isArray(existing.plugins)) {
      existingPlugins = existing.plugins;
    }
  } catch {
    // no existing config
  }

  const config = {
    version,
    tools: toolIds,
    projectName,
    createdAt: new Date().toISOString(),
    outputBase: 'docs/sparrow',
    codeBase: 'backend',
    frontendBase: 'frontend',
    ...(existingPlugins.length > 0 ? { plugins: existingPlugins } : {}),
  };

  const sparrowDir = join(projectRoot, SPARROW_DIR);
  mkdirSync(sparrowDir, { recursive: true });
  const configPath = join(sparrowDir, 'sparrow.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  return configPath;
}

/**
 * Generate the project.md wizard file under docs/sparrow/.
 * Returns the path to the created file.
 */
export function generateProjectMd(ctx: ProjectContext): string {
  const { projectRoot, projectName, version, toolIds } = ctx;
  const mdPath = join(projectRoot, 'docs', 'sparrow', 'project.md');
  mkdirSync(dirname(mdPath), { recursive: true });
  const content = generateProjectMdContent(projectName, version, toolIds);
  writeFileSync(mdPath, content, 'utf-8');
  return mdPath;
}
