/**
 * OpenCode adapter.
 *
 * OpenCode uses:
 * - Skills: `.opencode/skills/<skill-name>/SKILL.md` with YAML frontmatter
 * - Commands: `.opencode/commands/sparrow-<name>.md`
 *
 * OpenCode uses a similar format to Claude Code but with slightly
 * different path conventions.
 */

import type { CommandContent, ToolCommandAdapter } from './types.js';

export const opencodeAdapter: ToolCommandAdapter = {
  toolId: 'opencode',

  getSkillPath(skillId: string): string {
    return `.opencode/skills/${skillId}/SKILL.md`;
  },

  getCommandPath(skillId: string): string {
    // OpenCode uses hyphen-separated names for commands
    return `.opencode/commands/${skillId}.md`;
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
