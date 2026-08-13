/**
 * Pi adapter.
 *
 * Pi implements the Agent Skills standard:
 * - Skills: `.pi/skills/<skill-id>/SKILL.md` with YAML frontmatter, invoked via `/skill:name`
 * - Commands: Pi has no dedicated command directory. Its markdown slash-command
 *   mechanism is prompt templates at `.pi/prompts/*.md`, invoked via `/name`
 *   (the filename without `.md` becomes the command name).
 *
 * @see https://github.com/badlogic/pi
 */

import { createAdapter } from './shared.js';

export const piAdapter = createAdapter({
  toolId: 'pi',
  skillPath: (skillId) => `.pi/skills/${skillId}/SKILL.md`,
  commandPath: (skillId) => `.pi/prompts/${skillId}.md`,
  commandStyle: 'pi',
});
