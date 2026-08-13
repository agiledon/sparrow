/**
 * Claude Code adapter.
 *
 * Claude Code uses:
 * - Skills: `.claude/skills/<skill-name>/SKILL.md` with YAML frontmatter
 * - Commands: `.claude/commands/sparrow/<name>.md` with YAML frontmatter
 *
 * Skills are invoked via `/skill-name` and commands are project-specific slash commands.
 */

import { createAdapter } from './shared.js';

export const claudeAdapter = createAdapter({
  toolId: 'claude',
  skillPath: (skillId) => `.claude/skills/${skillId}/SKILL.md`,
  commandPath: (skillId) => `.claude/commands/sparrow/${skillId}.md`,
});
