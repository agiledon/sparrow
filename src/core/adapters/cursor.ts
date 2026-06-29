/**
 * Cursor adapter.
 *
 * Cursor uses:
 * - Skills: `.cursor/skills/<skill-name>/SKILL.md`
 * - Commands: `.cursor/commands/sparrow-<name>.md` (hyphen-separated)
 *
 * Cursor skills use YAML frontmatter with a slightly different schema.
 */

import type { CommandContent, ToolCommandAdapter } from './types.js';

export const cursorAdapter: ToolCommandAdapter = {
  toolId: 'cursor',

  getSkillPath(skillId: string): string {
    return `.cursor/skills/${skillId}/SKILL.md`;
  },

  getCommandPath(skillId: string): string {
    return `.cursor/commands/${skillId}.md`;
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
