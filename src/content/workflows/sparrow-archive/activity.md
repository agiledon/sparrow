# Sparrow Archive — 变更归档与 master promote

产品级收束：按状态门控，仅归档已完成的 slug；归档时 **必须** promote。只版本化交付规格，不版本化源代码。

## 完成标准

- 已运行检查并经用户确认
- 已完成内容进入 `change/archive/{synced-at}-{change-id}/`；未完成 `design/{slug}/` 不进 archive、不 promote
- 已 promote 至 `docs/sparrow/master/`（append-only delta）
- 视需要更新 `docs/sparrow/master/project.md` 与修订历史
- **未**将 `backend/`、`frontend/`、`edge/bff/` 源代码纳入 archive
- 完整则结束变更；部分则剪掉已完成 slug，**保留** changeId

本阶段不在 change 工作区新增文档。

## 按需加载

现在只读取 `steps/01-gate.md`，并只执行该文件。
禁止列举或预读步骤目录及其附属文件。
未进入的步骤、被跳过的分支，不得读取其文件。

## 步骤

1. 确认状态并读取契约
2. 选择 change
3. 检查完成度
4. 用户确认
5. 可选拓扑修订
6. 写入归档
7. Promote
8. 更新基线文档
9. 结束或剪枝
