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
  interaction: '提问时调用 `AskQuestion`，一次只传一道题。推荐项放在第一位。不要在选项里再写「自定义输入」，自由文本用卡片自带的 Other。本次会话没有该工具或调用被拒绝时，在对话里把可选项分行编号（`1`、`2`、`3`…），最后一行是「自定义输入」，用户输入序号。',
});
