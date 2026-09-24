/**
 * Claude Code adapter.
 *
 * Claude Code uses:
 * - Skills: `.claude/skills/<skill-name>/SKILL.md` with YAML frontmatter
 * - Commands: `.claude/commands/sparrow/<name>.md` with YAML frontmatter
 *
 * Skills are invoked via `/skill-name` and commands are project-specific slash commands.
 */

import { createAdapter } from './shared.js';

export const claudeAdapter = createAdapter({
  toolId: 'claude',
  skillPath: (skillId) => `.claude/skills/${skillId}/SKILL.md`,
  commandPath: (skillId) => `.claude/commands/sparrow/${skillId}.md`,
  interaction: '提问时调用 `AskUserQuestion`，一次只传一道题，2–4 个选项。推荐项放在第一位，标签加 `(Recommended)`。选项标签不要自带序号，界面会自动显示 `1.`、`2.`、`3.`，用户按该序号选择。不要在选项里再写「自定义输入」，界面会自动提供 Other。多选设置 `multiSelect`。本次会话没有该工具或调用被拒绝时，在对话里把可选项分行编号（`1`、`2`、`3`…），最后一行是「自定义输入」，用户输入序号。',
});
