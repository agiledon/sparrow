## 执行顺序检查

\`\`\`
当前步骤：sparrow-plan（第 5 步 / 共 8 步）
所属层级：团队级（team-level），针对特定限界上下文或交互上下文
前置条件（必须全部存在）：
  1. docs/sparrow/change/current/{activeChangeId}/design/{slug}/spec.md
  2. docs/sparrow/change/current/{activeChangeId}/design/{slug}/api.md
  3. docs/sparrow/change/current/{activeChangeId}/design/{slug}/tech.md
  4. docs/sparrow/change/current/{activeChangeId}/design/{slug}/model.md
下一步骤：sparrow-apply @{slug}（第 6 步）→ sparrow-verify @{slug}（第 7 步）
\`\`\`

**前置条件检查**：
- 如果上述任一前置文件不存在，请提示用户缺少哪个文件，以及需要先执行什么步骤
- 如果用户未指定 slug，请列出可用的 slug 让用户选择（从 project.md 中读取）
- 如果目标文件已存在，请参考下方"输出文件存在性检查"章节处理

### Slug 类型判定

1. 读取 \`docs/sparrow/change/current/{activeChangeId}/project.md\` 的「限界上下文设计」部分
2. 如果当前 slug 标注了 **— *交互上下文*** 标记 → 执行下方「交互上下文实现计划」章节
3. 否则 → 执行下方「后端限界上下文实现计划」章节（保持现有逻辑）
