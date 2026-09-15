## 执行顺序检查

\`\`\`
当前步骤：sparrow-verify（第 7 步 / 共 8 步）
所属层级：团队级（team-level），针对特定限界上下文或交互上下文
前置条件：目标 slug 已执行 sparrow-apply（plan.md 全部 \`- [x]\` 且 code_review.md 已生成）
下一步骤：sparrow-archive（第 8 步；仅当验证无阻塞问题时）
\`\`\`

**前置条件检查**：
- 如果用户未指定 slug，从 \`docs/sparrow/change/current/{activeChangeId}/project.md\` 列出所有限界上下文（含交互上下文），让用户选择单个 slug、多个 slug，或**全部**
- 对每个选定的 slug，**必须先判定是否已 apply**（见下方「Apply 门禁」）；未 apply 的 slug 提示并跳过

{{HARNESS}}
