# 确认状态并读取契约

读 `references/archive-gate.md`（完成判定、完整/部分归档、promote 命令）。语义以该契约为准。

在项目根执行 `node <本 skill 目录>/scripts/sparrow-state.mjs show`。不要把脚本复制到项目根。`tbd` → **sparrow-requirement**；`brownfield` → 停止。`changeId` 为空且 `change/current/` 无未归档目录时停止，请用户执行 **sparrow-requirement**。不要 `set-step`。archive 不是修订，不追加 `delta.md`。通过后执行同一脚本的 `set-step archive ongoing`。

下一步：读取 `steps/02-select.md`。不要提前打开它。
