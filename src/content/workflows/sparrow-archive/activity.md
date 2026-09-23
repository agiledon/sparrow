# Sparrow Archive — 变更归档与 master promote

产品级收束：按 `sparrow-state` 门控，仅归档已完成的 slug；归档时 **必须** promote。只版本化交付规格，不版本化源代码。

**权威契约**：先读本 skill 的 `references/archive-gate.md`（完成判定、完整/部分归档、`sparrow-promote.mjs` 命令）。下文为执行清单；语义以该契约为准。

## 完成标准

- 已按 `archive-gate.md` 运行 `check-archive` 并经用户确认
- 已完成内容进入 `change/archive/{synced-at}-{change-id}/`；未完成 `design/{slug}/` 不进 archive、不 promote
- 已运行 `scripts/sparrow-promote.mjs` → `docs/sparrow/master/`（append-only delta）
- 按模板更新：
  - `docs/sparrow/master/project.md`
  - `assets/revision-history.md` + `assets/revision-history-entry.md` → `docs/sparrow/master/requirement/revision-history.md` 与 `docs/sparrow/master/design/revision-history.md`
  - 若有 BC 拓扑变更：`assets/bc-revision-history.md` + `assets/bc-revision-history-entry.md` → `docs/sparrow/master/architecture/bc-revision-history.md`
- **未**将 `backend/`、`frontend/`、`edge/bff/` 源代码纳入 archive
- 完整 → `archive-done`；部分 → `prune-contexts`，**保留** changeId

本阶段不在 change 工作区新增文档。

## 步骤

1. `scripts/sparrow-state.mjs show`。`tbd` → **sparrow-requirement**；`brownfield` → 停止。通过后 `set-step archive ongoing`。
2. 选择 `change/current/` 下 change-id；读 `proposal.md`。
3. `scripts/sparrow-state.mjs check-archive [change-id]`，展示汇总（详见 `references/archive-gate.md`）。
4. **用户确认**后再动盘（完整 / 部分 / 取消；无已完成 slug 禁止部分归档）。
5. BC 拓扑变更须用户确认后改 master 目录树并追加 bc-revision-history。
6. `synced-at` = `YYYY-MM-DD`；按确认结果写入 archive（完整整迁 / 部分仅共享+已完成 slug）。
7. **Promote（必做）**：`scripts/sparrow-promote.mjs <change-id> <synced-at> ...`（参数见 `archive-gate.md`）。
8. 视需要更新 `docs/sparrow/master/project.md`。
9. 完整：`archive-done`；部分：`prune-contexts <ready-slug…>`。
