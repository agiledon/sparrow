/**
 * Skill generation engine.
 *
 * Assembles skill markdown from templates, injects prerequisite checks,
 * output path configuration, and next-step hints. Generates per-tool
 * formatted files via the adapter registry.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { SkillDefinition } from './config.js';
import { getOrderedSkills } from './config.js';
import { getAdapter } from './adapters/index.js';
import type { CommandContent } from './adapters/types.js';
import { generateProjectMdContent } from './project-md.js';

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

/**
 * Generate a sparrow.json config file under .sparrow/ in the project root.
 */
export function generateProjectConfig(
  projectRoot: string,
  toolIds: string[],
  version: string,
  projectName: string
): string {
  const config = {
    version,
    tools: toolIds,
    projectName,
    createdAt: new Date().toISOString(),
    outputBase: 'docs/sparrow',
    codeBase: 'backend',
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
export function generateProjectMd(
  projectRoot: string,
  projectName: string,
  sparrowVersion: string,
  toolIds: string[]
): string {
  const mdPath = join(projectRoot, 'docs', 'sparrow', 'project.md');
  mkdirSync(dirname(mdPath), { recursive: true });
  const content = generateProjectMdContent(projectName, sparrowVersion, toolIds);
  writeFileSync(mdPath, content, 'utf-8');
  return mdPath;
}
