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
  interaction: '提问时调用 `AskUserQuestion`，一次只传一道题。推荐项放在第一位。不要在选项里再写「自定义输入」，自由文本用卡片自带的其他项。本次会话没有该工具或调用被拒绝时，在对话里把可选项分行编号（`1`、`2`、`3`…），最后一行是「自定义输入」，用户输入序号。',
});
