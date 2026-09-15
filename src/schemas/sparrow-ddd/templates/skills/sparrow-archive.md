# Sparrow Archive — 变更归档与 master promote


## 1. 选择变更

1. 列出 \`docs/sparrow/change/current/\` 下所有子目录。
2. 若多个，**请用户选择**要归档的 \`{change-id}\`（遵守 \`global/always/interactive-interaction.md\`）；若仅一个，确认后继续。
3. 读取 \`change/current/{change-id}/proposal.md\`（含 \`development-mode\`）。

## 2. 完整性校验

- S4 BC：\`design/{slug}/plan.md\` 全 \`[x]\`、\`code_review.md\`、\`verify_report.md\` 无 P0/P1。
- 未完成项 → 询问：仍归档 / 取消。

## 3. BC 拓扑确认（promote 前必做）

若 arch 阶段有 BC 新增/删除/拆分/合并/重分配，列出清单（每条）：

| 字段 | 内容 |
|------|------|
| 操作类型 | BC 不变 / 新增 / 删除 / 拆分 / 合并 / 重分配 |
| 目的 | … |
| 可能后果 | 依赖、API、集成边、代码模块、数据迁移等 |

**用户确认**（是 / 否 / 修改）后，方可执行 master 目录树变更；并追加 \`docs/sparrow/master/architecture/bc-revision-history.md\`（含 synced-at 与确认记录）。

## 4. 归档与 promote

1. \`synced-at\` = 当前日期 \`YYYY-MM-DD\`。
2. 将 \`change/current/{change-id}/\` **移动**至 \`change/archive/{synced-at}-{change-id}/\`。
3. **Promote 至 master**：
   - 将归档树中规格**合并进** \`docs/sparrow/master/\` 对应路径（**排除** \`design/{slug}/plan.md\`）。
   - 在 \`master/requirement/revision-history.md\` 与 \`master/design/revision-history.md\` 各追加一条修订（含 **synced-at**、change-id、ADDED/MODIFIED/REMOVED 摘要及文件路径）。
4. 更新 \`docs/sparrow/master/project.md\` 索引；清空 \`.sparrow/active-change.json\` 的 \`changeId\`（若指向本 change）。
5. 已移动则 \`change/current/{change-id}/\` 不再存在。

## 5. 质量检查

- [ ] 用户已选择 change-id
- [ ] BC 拓扑清单已确认（若适用）
- [ ] 已移动至 \`change/archive/{synced-at}-{change-id}/\`
- [ ] master 正文与两份 revision-history 已更新
- [ ] bc-revision-history 已更新（若适用）

## 完成

🎉 变更 \`{change-id}\` 已归档并 promote。下一次需求从 **/sparrow-requirement** 创建或续用 \`change/current/\`。

