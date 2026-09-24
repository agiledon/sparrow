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
  interaction: '提问时调用 `AskUserQuestion`，一次只传一道题，2–4 个选项。推荐项放在第一位。不要在选项里再写「自定义输入」，允许用户输入选项之外的答案。多选设置 `multiSelect`。不要用回合结束后的推荐卡片来提问。本次会话没有该工具或调用被拒绝时，在对话里把可选项分行编号（`1`、`2`、`3`…），最后一行是「自定义输入」，用户输入序号。',
});
