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

import { createAdapter } from './shared.js';

export const opencodeAdapter = createAdapter({
  toolId: 'opencode',
  skillPath: (skillId) => `.opencode/skills/${skillId}/SKILL.md`,
  commandPath: (skillId) => `.opencode/commands/${skillId}.md`,
});
