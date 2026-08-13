/**
 * OpenAI Codex adapter.
 *
 * Codex supports Agent Skills standard:
 * - Skills: `.codex/skills/<skill-id>/SKILL.md` with YAML frontmatter
 * - Commands: `.codex/commands/<skill-id>.md`
 *
 * @see https://developers.openai.com/codex/skills/
 */

import { createAdapter } from './shared.js';

export const codexAdapter = createAdapter({
  toolId: 'codex',
  skillPath: (skillId) => `.codex/skills/${skillId}/SKILL.md`,
  commandPath: (skillId) => `.codex/commands/${skillId}.md`,
});
