# Sparrow Archive — 变更归档与 master promote

产品级收束：按 `sparrow-state` 门控，仅归档已完成的 slug；归档时 **必须** 以 append-only delta 同步 `docs/sparrow/master/`。只版本化交付规格，不版本化源代码。

## 完成标准

- 已运行 `scripts/sparrow-state.mjs check-archive`，用户确认归档范围（完整或部分）
- 已完成 slug 的交付物已进入 `change/archive/{synced-at}-{change-id}/`
- 未完成 `design/{slug}/` **未**进入 archive、**未** promote
- 已运行 `scripts/sparrow-promote.mjs` promote 到 `docs/sparrow/master/`（ADDED 新建 / MODIFIED 文末追加 delta / REMOVED 仅记历史；**永不删除** master 既有文件）
- 按模板更新：
  - `docs/sparrow/master/project.md`
  - `assets/revision-history.md` + `assets/revision-history-entry.md` → `docs/sparrow/master/requirement/revision-history.md` 与 `docs/sparrow/master/design/revision-history.md`（按 `### shared` / `### slug: {slug}` 分组）
  - 若有 BC 拓扑变更：`assets/bc-revision-history.md` + `assets/bc-revision-history-entry.md` → `docs/sparrow/master/architecture/bc-revision-history.md`
- **未**将 `backend/`、`frontend/`、`edge/bff/` 源代码纳入 archive 版本管理
- 完整归档后：`scripts/sparrow-state.mjs archive-done`；部分归档后：`prune-contexts` 已完成 slug，**保留** changeId

本阶段不在 change 工作区新增文档。

## 步骤

1. 运行本 skill 的 `scripts/sparrow-state.mjs show`。`tbd` 则先 **sparrow-requirement**；`brownfield` 则停止。通过后 `set-step archive ongoing`。
2. 列出 `change/current/` 子目录；多个则请用户选择 change-id。读取 `proposal.md`。
3. 运行 `scripts/sparrow-state.mjs check-archive [change-id]`，向用户展示汇总表（每 slug：`current-step` / `status` / 是否可归档）。完成判定：`pipeline.contexts[slug].current-step === "verify"` **且** `status === "done"`。Slug 清单 = contexts keys ∪ `design/*`；仅有目录无 state → 未完成。
4. **用户确认门控**（确认前禁止动盘）：
   - 全部完成 → 建议**完整归档**
   - 有未完成 → 建议**不要归档**；若用户坚持 → **部分归档**（仅已完成 slug）
   - 无任何已完成 slug → **禁止**部分归档，停止
   - 用户取消 → 停止
5. 若有 BC 新增/删除/拆分/合并/重分配：列出清单，用户确认后再改 master 目录树，并按 bc-revision-history 模板追加（目录树变更仍须用户确认；正文 promote 仍为 append-only）。
6. `synced-at` = `YYYY-MM-DD`。按确认结果落盘：
   - **完整归档**：整目录 `change/current/{id}/` → `change/archive/{synced-at}-{id}/`
   - **部分归档**：只把共享物（`proposal.md`、`requirement/`、`architecture/`、`project.md` 等）+ 已完成 `design/{slug}/` 写入 archive；未完成 slug 留在 `current`
7. **Promote（必做）**：运行 `scripts/sparrow-promote.mjs <change-id> <synced-at> [--source archive|current] [--folder <name>] [--slugs slug1,slug2]`（部分归档传 `--slugs` = 已完成 slug）。排除 `design/{slug}/plan.md` 与 `proposal.md`。规则：
   - **ADDED**：master 无该路径 → 新建写入源内容
   - **MODIFIED**：master 已有且内容不同 → **不覆盖**；在文末追加带 change-id / synced-at / `MODIFIED` 的 delta 区（正文为本次源全文）
   - **REMOVED**：源侧缺失 → **不删** master 文件；仅在 revision-history 记录
   - 历史写入 `assets/revision-history.md` + `assets/revision-history-entry.md` → `docs/sparrow/master/requirement/revision-history.md` 与 `docs/sparrow/master/design/revision-history.md`（按 `### shared` / `### slug: {slug}` 分组）
8. 更新 `docs/sparrow/master/project.md`（若完整归档或共享物有变）。
9. 收尾状态：
   - **完整**：`scripts/sparrow-state.mjs archive-done`（清空 changeId；greenfield → iteration；pipeline 置空）
   - **部分**：`scripts/sparrow-state.mjs prune-contexts <ready-slug…>`，保留 changeId 与未完成 contexts

## 检查清单

- [ ] 用户已选择 change-id
- [ ] `check-archive` 汇总已展示且用户已确认（完整 / 部分 / 取消）
- [ ] 未完成 slug 未进入 archive / promote（部分归档时）
- [ ] BC 拓扑清单已确认（若适用）
- [ ] 已写入 archive；promote 已执行（append-only delta）
- [ ] revision-history 含 ADDED/MODIFIED/REMOVED 且按 slug 归类
- [ ] 未将源代码 promote 至 master
- [ ] 完整 → `archive-done`；部分 → `prune-contexts` 且保留 changeId

## 完成

- 完整归档：变更 `{change-id}` 已归档。下一次需求从 **/sparrow-requirement** 开始。
- 部分归档：已完成 slug 已同步 master；未完成 slug 仍在 `change/current/{change-id}/`，继续团队级步骤。

{{HARNESS}}
