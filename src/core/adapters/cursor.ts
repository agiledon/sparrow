/**
 * Cursor adapter.
 *
 * Cursor uses:
 * - Skills: `.cursor/skills/<skill-name>/SKILL.md`
 * - Commands: `.cursor/commands/sparrow-<name>.md` (hyphen-separated)
 *
 * Cursor skills use YAML frontmatter with a slightly different schema.
 */

import { createAdapter } from './shared.js';

export const cursorAdapter = createAdapter({
  toolId: 'cursor',
  skillPath: (skillId) => `.cursor/skills/${skillId}/SKILL.md`,
  commandPath: (skillId) => `.cursor/commands/${skillId}.md`,
});
