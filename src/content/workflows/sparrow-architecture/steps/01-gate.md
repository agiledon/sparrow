# 确认状态

在项目根执行 `node <本 skill 目录>/scripts/sparrow-state.mjs show`。不要把脚本复制到项目根。`development-mode` 为 `tbd` 则先 **sparrow-requirement**；为 `brownfield` 则停止（暂不支持）。`changeId` 为空且 `change/current/` 无未归档目录时停止，请用户执行 **sparrow-requirement**（已有 archive 或 master 时从那里进入 increment）。不要 `set-step`。通过后执行同一脚本的 `set-step architecture ongoing`。本次修订当前 change，不新建 change-id。

下一步：读取 `steps/02-layout.md`。不要提前打开它。
