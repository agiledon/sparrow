## 执行顺序检查

在执行之前，请检查当前阶段是否合适：

\`\`\`
当前步骤：sparrow-design（第 3 步 / 共 8 步）
所属层级：团队级（team-level），针对特定限界上下文或交互上下文
前置条件：
  1. docs/sparrow/change/current/{activeChangeId}/architecture/application.md 必须存在（后端 BC）
     或 docs/sparrow/change/current/{activeChangeId}/architecture/frontend.md 必须存在（交互上下文）
  2. docs/sparrow/change/current/{activeChangeId}/design/{slug}/spec.md 必须存在
下一步骤：sparrow-model @{slug}（团队级）
\`\`\`

**前置条件检查**：
- 如果 \`docs/sparrow/change/current/{activeChangeId}/architecture/application.md\` 不存在且 \`docs/sparrow/change/current/{activeChangeId}/architecture/frontend.md\` 不存在，请提示用户先执行 **sparrow-arch**
- 如果 \`docs/sparrow/change/current/{activeChangeId}/design/{slug}/spec.md\` 不存在，请提示用户先执行 **sparrow-arch**
- 如果用户未指定 slug，请列出可用的 slug 让用户选择（从 project.md 中读取所有 BC 和交互上下文）

### Slug 类型判定

在执行 design 之前，先判定当前 slug 是**后端限界上下文**还是**交互上下文**：

1. 读取 \`docs/sparrow/change/current/{activeChangeId}/project.md\` 的「限界上下文设计」部分
2. 查找当前 slug 对应的子章节
3. 如果标注了 **— *交互上下文*** 标记 → 当前 slug 是交互上下文，执行下方「交互上下文设计」分支
4. 否则 → 当前 slug 是后端 BC，执行下方「后端限界上下文设计」分支（保持现有逻辑）
