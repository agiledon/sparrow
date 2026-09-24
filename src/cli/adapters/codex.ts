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
  interaction: '提问时调用 `request_user_input`，一次只传一道题，2–3 个选项。推荐项放在第一位，标签加 `(Recommended)`。不要在选项里再写「自定义输入」，客户端会自动加 Other。调用返回 unavailable 时，在对话里把可选项分行编号（`1`、`2`、`3`…），最后一行是「自定义输入」，用户输入序号。',
});
