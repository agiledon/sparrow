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
  interaction: '本次会话看得见 `ask_user_question` 时调用它，一次只传一道题，推荐项放在第一位，不要在选项里再写「自定义输入」。否则在对话里把可选项分行编号（`1`、`2`、`3`…），最后一行是「自定义输入」，用户输入序号。',
});
