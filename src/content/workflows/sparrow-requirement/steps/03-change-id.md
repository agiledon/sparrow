# 确认 change-id 并创建工作区

1. 从项目根运行 `scripts/ensure-change-workspace.mjs --check`。
2. 若退出码 1：按 harness `requirement/requirements.md`「活动变更 ID 确认纪律」只确认 change-id；用户中止则停止且不创建子目录。
3. 确认后运行 `scripts/ensure-change-workspace.mjs --create {change-id}`（经 `sparrow-state.mjs` 写入 active-change 并将 pipeline 的 requirement 设为 ongoing）。
4. `--check`（工作区目录已存在）与 `--create` 都会在此时写入 `project.md`（已存在则不覆盖；占位符来自 `.sparrow/sparrow-config.json`）。
5. 然后按 `assets/proposal.md` 填写 `proposal.md`（`development-mode` 用配置值）。禁止向 `master/` 写入。

本步只打开 `assets/proposal.md`。不要打开其他模板。

下一步：读取 `steps/04-revise.md`。不要提前打开它。
