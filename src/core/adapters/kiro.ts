/**
 * Kiro adapter.
 *
 * Kiro supports Agent Skills standard and discovers slash commands
 * directly from `.kiro/skills/`. No separate commands directory needed.
 * - Skills: `.kiro/skills/<skill-id>/SKILL.md` with YAML frontmatter
 *
 * @see https://kiro.dev/docs/skills/
 */

import { createAdapter } from './shared.js';

export const kiroAdapter = createAdapter({
  toolId: 'kiro',
  skillPath: (skillId) => `.kiro/skills/${skillId}/SKILL.md`,
  commandPath: () => null,
});
