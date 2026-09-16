## 执行顺序检查

\`\`\`
当前步骤：sparrow-apply（第 6 步 / 共 8 步）
所属层级：团队级（team-level），针对特定限界上下文或交互上下文
前置条件：docs/sparrow/change/current/{activeChangeId}/design/{slug}/plan.md 必须存在
后续步骤：sparrow-verify @{slug}（第 7 步）；全部 slug verify 通过后，若处于 revise 模式可执行 sparrow-archive
\`\`\`

**前置条件检查**：
- 如果 \`docs/sparrow/change/current/{activeChangeId}/design/{slug}/plan.md\` 不存在，请提示用户先执行 **sparrow-plan @{slug}**
- 如果用户未指定 slug，请列出可用的 slug 让用户选择（从 project.md 中读取）
- 如果 plan.md 中的所有步骤都已标记为 \`- [x]\`，说明当前上下文 apply 已执行完毕，应提示执行 **sparrow-verify @{slug}**

### Slug 类型判定

1. 读取 \`docs/sparrow/change/current/{activeChangeId}/project.md\` 的「限界上下文设计」部分
2. 如果当前 slug 标注了 **— *交互上下文*** 标记 → 执行下方「交互上下文代码生成」章节
3. 否则 → 执行下方「后端限界上下文代码生成」章节（保持现有逻辑）

{{HARNESS}}
