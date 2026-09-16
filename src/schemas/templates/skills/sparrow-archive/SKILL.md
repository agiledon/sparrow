# Sparrow Archive — 变更归档与 master promote

## 完成标准

- `change/current/{change-id}/` 已移动到 `change/archive/{synced-at}-{change-id}/`
- 规格已 promote 到 `docs/sparrow/master/`（排除 `design/{slug}/plan.md` 与 `proposal.md`）
- 按模板追加：
  - `assets/revision-history.md` + `assets/revision-history-entry.md` → `docs/sparrow/master/requirement/revision-history.md` 与 `docs/sparrow/master/design/revision-history.md`
  - 若有 BC 拓扑变更：`assets/bc-revision-history.md` + `assets/bc-revision-history-entry.md` → `docs/sparrow/master/architecture/bc-revision-history.md`
- `docs/sparrow/master/project.md` 已更新；`.sparrow/active-change.json` 的 `changeId` 已清空（若指向本 change）

本阶段不在 change 工作区新增文档。

## 步骤

1. 列出 `change/current/` 子目录；多个则请用户选择。读取 `proposal.md`。
2. 完整性：S4 BC 的 plan 全 `[x]`、`code_review.md`、`verify_report.md` 无 P0/P1。未完成则询问仍归档 / 取消。
3. 若有 BC 新增/删除/拆分/合并/重分配：列出清单，用户确认后再改 master 目录树，并按 bc-revision-history 模板追加。
4. `synced-at` = `YYYY-MM-DD`。移动 current 到 archive。Promote（可用项目已有 promote 能力；条目格式以 `assets/` 模板为准）。
5. 更新 `docs/sparrow/master/project.md`；清空 active change-id。

## 检查清单

- [ ] 用户已选择 change-id
- [ ] BC 拓扑清单已确认（若适用）
- [ ] 已移动至 archive
- [ ] master 正文与 revision-history 已更新

## 完成

变更 `{change-id}` 已归档。下一次需求从 **/sparrow-requirement** 开始。

{{HARNESS}}
