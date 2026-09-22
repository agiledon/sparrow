/**
 * Skill generation — plugin assembly helpers and init config.
 * Core workflow skills are installed via install-agent-skills (kernel Workflow → AgentSkillPackage).
 */

import { SPARROW_DIR } from '../../kernel/runtime/spec-paths.js';
import { readProjectConfig, writeProjectConfig } from '../../kernel/runtime/project-config.js';
import type { SkillDefinition, SkillRegistry } from '../../kernel/skill/registry.js';
import { installAgentSkills } from './install-agent-skills.js';
import type { CommandContent } from '../adapters/types.js';
import { getWorkflowStepBySkillId } from '../../kernel/content/skill-composition.js';

import type { Plugin } from '../../plugins/types.js';
import { buildPluginSkillBody } from '../../plugins/skill-body.js';

export { HARNESS_TOKEN } from '../../kernel/skill/HarnessToken.js';

/**
 * Assemble CommandContent for a plugin-contributed skill (registry template).
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

/**
 * Generate skill and command files for a list of tool ids.
 */
export function generateSkillFiles(
  projectRoot: string,
  toolIds: string[],
  registry: SkillRegistry
): { toolId: string; files: string[] }[] {
  return installAgentSkills(projectRoot, toolIds, registry);
}

export { SPARROW_DIR };

export interface ProjectContext {
  projectRoot: string;
  projectName: string;
  version: string;
  toolIds: string[];
  lang?: string;
}

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
