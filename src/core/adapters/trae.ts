/**
 * Trae (ByteDance) adapter.
 *
 * Trae supports Agent Skills standard:
 * - Skills: `.trae/skills/<skill-id>/SKILL.md` with YAML frontmatter
 * - Commands: `.trae/commands/<skill-id>.md`
 *
 * @see https://github.com/bytedance/trae-agent
 */

import type { CommandContent, ToolCommandAdapter } from './types.js';

export const traeAdapter: ToolCommandAdapter = {
  toolId: 'trae',

  getSkillPath(skillId: string): string {
    return `.trae/skills/${skillId}/SKILL.md`;
  },

  getCommandPath(skillId: string): string {
    return `.trae/commands/${skillId}.md`;
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
