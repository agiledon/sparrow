/**
 * Trae (ByteDance) adapter.
 *
 * Trae supports Agent Skills standard:
 * - Skills: `.trae/skills/<skill-id>/SKILL.md` with YAML frontmatter
 * - Commands: `.trae/commands/<skill-id>.md`
 *
 * @see https://github.com/bytedance/trae-agent
 */

import { createAdapter } from './shared.js';

export const traeAdapter = createAdapter({
  toolId: 'trae',
  skillPath: (skillId) => `.trae/skills/${skillId}/SKILL.md`,
  commandPath: (skillId) => `.trae/commands/${skillId}.md`,
});
