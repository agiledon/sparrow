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

1. 若无活动 change-id（\`.sparrow/active-change.json\` 的 \`changeId\` 为空，且 \`docs/sparrow/change/current/\` 不存在或无子目录）：按 \`requirement/requirements.md\`「活动变更 ID 确认纪律」及 \`common/always/interactive-interaction.md\` 向用户确认 \`{change-id}\`。
   - **确认完成前禁止**在 \`docs/sparrow/change/current/\` 下创建 change-id 子目录或文件。若用户中止或未指定 change-id，**保持 \`current/\` 为空**，并停止执行。
   - 用户确认后：创建 \`docs/sparrow/change/current/{change-id}/\`，以及同构空目录 \`requirement/business/\`、\`requirement/quality/\`、\`requirement/ui/\`、\`architecture/\`、\`design/\`，并写入 \`proposal.md\`（Intent / Scope / Why / \`development-mode\`：greenfield | iteration | brownfield）。
   - **禁止**向 \`docs/sparrow/master/\` 写入。首次 archive 之前 master 必须保持为空。
2. 更新 \`.sparrow/active-change.json\` 的 \`changeId\`。
3. 若 \`master/\` 已有内容且 mode 为 iteration，进入 revise 增量；greenfield 首次可全量在 change 内编写。

{{HARNESS}}
