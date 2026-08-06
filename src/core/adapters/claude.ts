/**
 * Claude Code adapter.
 *
 * Claude Code uses:
 * - Skills: `.claude/skills/<skill-name>/SKILL.md` with YAML frontmatter
 * - Commands: `.claude/commands/sparrow/<name>.md` with YAML frontmatter
 *
 * Skills are invoked via `/skill-name` and commands are project-specific slash commands.
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

export const claudeAdapter: ToolCommandAdapter = {
  toolId: 'claude',

  getSkillPath(skillId: string): string {
    return `.claude/skills/${skillId}/SKILL.md`;
  },

  getCommandPath(skillId: string): string {
    // Claude Code commands use the sparrow/ subdirectory for namespacing
    return `.claude/commands/sparrow/${skillId}.md`;
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
    // Claude Code commands use the same format as skills
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

  formatHarnessRef,
};
