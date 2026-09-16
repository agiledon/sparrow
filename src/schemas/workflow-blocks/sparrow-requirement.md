## 执行顺序检查

在执行之前，请检查当前阶段是否合适：

- **本阶段**：sparrow-requirement（第 1 步，共 8 步）
- **所属层级**：产品级（product-level）
- **前置条件**：无（这是整个 DDD 流程的第一步）
- **输入要求**：用户需要提供原始需求文档或需求描述
- **检查逻辑**：
  - 如果当前目录下不存在 \`docs/sparrow/change/current/{activeChangeId}/requirement/business/prd-business.md\`，可以继续执行
  - 如果已经存在，请参考下方"输出文件存在性检查"章节处理


## 创建活动变更（requirement 开始时）

1. 若 \`docs/sparrow/change/current/\` 无子目录：按 \`requirement/requirements.md\`「活动变更 ID 确认纪律」及 \`common/always/interactive-interaction.md\` 向用户确认 \`{change-id}\`；**须先确认 change-id 后再**创建与 \`master/\` 同构的空目录树，并写入 \`proposal.md\`（Intent / Scope / Why / \`development-mode\`：greenfield | iteration | brownfield）。
2. 更新 \`.sparrow/active-change.json\` 的 \`changeId\`。
3. 若 \`master/\` 已有内容且 mode 为 iteration，进入 revise 增量；greenfield 首次可全量在 change 内编写。

{{HARNESS}}
