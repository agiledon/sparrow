/**
 * Qoder adapter.
 *
 * Qoder is a coding agent IDE.
 * - Skills: `.qoder/skills/<skill-id>/SKILL.md` with YAML frontmatter
 * - Commands: `.qoder/commands/<skill-id>.md`
 */

import type { CommandContent, ToolCommandAdapter } from './types.js';

export const qoderAdapter: ToolCommandAdapter = {
  toolId: 'qoder',

  getSkillPath(skillId: string): string {
    return `.qoder/skills/${skillId}/SKILL.md`;
  },

  getCommandPath(skillId: string): string {
    return `.qoder/commands/${skillId}.md`;
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
};
