/**
 * Qoder adapter.
 *
 * Qoder is a coding agent IDE.
 * - Skills: `.qoder/skills/<skill-id>/SKILL.md` with YAML frontmatter
 * - Commands: `.qoder/commands/<skill-id>.md`
 */

import { createAdapter } from './shared.js';

export const qoderAdapter = createAdapter({
  toolId: 'qoder',
  skillPath: (skillId) => `.qoder/skills/${skillId}/SKILL.md`,
  commandPath: (skillId) => `.qoder/commands/${skillId}.md`,
});
