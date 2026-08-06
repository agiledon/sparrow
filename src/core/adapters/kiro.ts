/**
 * Kiro adapter.
 *
 * Kiro supports Agent Skills standard and discovers slash commands
 * directly from `.kiro/skills/`. No separate commands directory needed.
 * - Skills: `.kiro/skills/<skill-id>/SKILL.md` with YAML frontmatter
 *
 * @see https://kiro.dev/docs/skills/
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

export const kiroAdapter: ToolCommandAdapter = {
  toolId: 'kiro',

  getSkillPath(skillId: string): string {
    return `.kiro/skills/${skillId}/SKILL.md`;
  },

  getCommandPath(_skillId: string): null {
    // Kiro discovers slash commands directly from the skills directory
    return null;
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

  formatHarnessRef,
};
