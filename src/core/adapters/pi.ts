/**
 * Pi adapter.
 *
 * Pi implements the Agent Skills standard:
 * - Skills: `.pi/skills/<skill-id>/SKILL.md` with YAML frontmatter, invoked via `/skill:name`
 * - Commands: Pi has no dedicated command directory. Its markdown slash-command
 *   mechanism is prompt templates at `.pi/prompts/*.md`, invoked via `/name`
 *   (the filename without `.md` becomes the command name).
 *
 * @see https://github.com/badlogic/pi
 */

import type { CommandContent, ToolCommandAdapter } from './types.js';
import { formatHarnessReference } from '../harness-init.js';

/**
 * Format a reference line to a constraint asset for a given scope.
 */
function formatHarnessRef(harnessRelPath: string, scope: 'global' | 'project'): string {
  const path = formatHarnessReference(harnessRelPath, scope);
  return scope === 'project'
    ? `- **项目级**（优先）：\`${path}\``
    : `- **全局级**：\`${path}\``;
}

export const piAdapter: ToolCommandAdapter = {
  toolId: 'pi',

  getSkillPath(skillId: string): string {
    return `.pi/skills/${skillId}/SKILL.md`;
  },

  getCommandPath(skillId: string): string {
    // Pi prompt templates register as `/name` slash commands (filename without .md)
    return `.pi/prompts/${skillId}.md`;
  },

  formatSkill(content: CommandContent): string {
    const frontmatter = [
      '---',
      `name: ${content.id}`,
      `description: ${content.description}`,
      `category: ${content.category}`,
      `tags: [${content.tags.join(', ')}]`,
      '---',
    ].join('\n');

    return `${frontmatter}\n\n${content.body}`;
  },

  formatCommand(content: CommandContent): string {
    // Pi prompt templates derive the command name from the filename, so only
    // `description` (and optionally `argument-hint`) belong in the frontmatter.
    const frontmatter = [
      '---',
      `description: ${content.description}`,
      '---',
    ].join('\n');

    return `${frontmatter}\n\n${content.body}`;
  },

  formatHarnessRef,
};
