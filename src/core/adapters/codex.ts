/**
 * OpenAI Codex adapter.
 *
 * Codex supports Agent Skills standard:
 * - Skills: `.codex/skills/<skill-id>/SKILL.md` with YAML frontmatter
 * - Commands: `.codex/commands/<skill-id>.md`
 *
 * @see https://developers.openai.com/codex/skills/
 */

import type { CommandContent, ToolCommandAdapter } from './types.js';

export const codexAdapter: ToolCommandAdapter = {
  toolId: 'codex',

  getSkillPath(skillId: string): string {
    return `.codex/skills/${skillId}/SKILL.md`;
  },

  getCommandPath(skillId: string): string {
    return `.codex/commands/${skillId}.md`;
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
