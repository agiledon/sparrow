import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { getAdapter } from '../adapters/index.js';
import type { SkillDefinition, SkillRegistry } from '../../kernel/skill/registry.js';
import { assembleSkillContent } from './generation.js';
import { WorkflowBuilderRegistry } from '../../kernel/workflow/builder/WorkflowBuilderRegistry.js';

/** Workflow ids removed in prior releases; cleaned up on regenerate. */
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

function writePluginSkill(
  projectRoot: string,
  adapter: ReturnType<typeof getAdapter>,
  skill: SkillDefinition,
  registry: SkillRegistry,
): string[] {
  const content = assembleSkillContent(skill, registry);
  const skillRelPath = adapter.getSkillPath(skill.id);
  content.skillRelPath = skillRelPath;
  const skillPath = join(projectRoot, skillRelPath);
  mkdirSync(dirname(skillPath), { recursive: true });
  writeFileSync(skillPath, adapter.formatSkill(content), 'utf-8');
  const created = [skillRelPath];
  const commandRelPath = adapter.getCommandPath(skill.id);
  if (commandRelPath !== null) {
    const commandPath = join(projectRoot, commandRelPath);
    mkdirSync(dirname(commandPath), { recursive: true });
    writeFileSync(commandPath, adapter.formatCommand(content), 'utf-8');
    created.push(commandRelPath);
  }
  return created;
}

/**
 * Generate agent skill files for selected tools (core workflows + plugin skills).
 */
export function installAgentSkills(
  projectRoot: string,
  toolIds: string[],
  registry: SkillRegistry,
): { toolId: string; files: string[] }[] {
  const workflowRegistry = new WorkflowBuilderRegistry();
  const workflows = workflowRegistry.buildAll();
  const coreIds = new Set(workflows.map((w) => w.id as string));

  const pluginSkills = registry.getOrderedSkills().filter((s) => !coreIds.has(s.id));

  const results: { toolId: string; files: string[] }[] = [];

  for (const toolId of toolIds) {
    const adapter = getAdapter(toolId);
    const createdFiles: string[] = [];

    for (const workflow of workflows) {
      const pkg = workflow.createAgentSkillPackage();
      const { skillRelPath, createdRelPaths } = adapter.writeSkill(projectRoot, pkg);
      createdFiles.push(...createdRelPaths);
      const commandRel = adapter.writeCommand(projectRoot, pkg, skillRelPath);
      if (commandRel) {
        createdFiles.push(commandRel);
      }
    }

    for (const skill of pluginSkills) {
      createdFiles.push(...writePluginSkill(projectRoot, adapter, skill, registry));
    }

    results.push({ toolId, files: createdFiles });
  }

  removeDeprecatedSkillFiles(projectRoot, toolIds);
  return results;
}
