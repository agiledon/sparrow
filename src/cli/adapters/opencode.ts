/**
 * OpenCode adapter.
 *
 * OpenCode uses:
 * - Skills: `.opencode/skills/<skill-name>/SKILL.md` with YAML frontmatter
 * - Commands: `.opencode/commands/sparrow-<name>.md`
 *
 * OpenCode uses a similar format to Claude Code but with slightly
 * different path conventions.
 */

import { createAdapter } from './shared.js';

export const opencodeAdapter = createAdapter({
  toolId: 'opencode',
  skillPath: (skillId) => `.opencode/skills/${skillId}/SKILL.md`,
  commandPath: (skillId) => `.opencode/commands/${skillId}.md`,
  interaction: '提问时调用 `question`，一次只传一道题。推荐项放在第一位，标签加 `(Recommended)`。不要在选项里再写「自定义输入」，`custom` 默认会加上 “Type your own answer”。多选设置 `multiple: true`。本次会话没有该工具或调用被拒绝时，在对话里把可选项分行编号（`1`、`2`、`3`…），最后一行是「自定义输入」，用户输入序号。',
});
