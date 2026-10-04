# 确认状态与 slug

在项目根执行 `node <本 skill 目录>/scripts/sparrow-state.mjs show`。不要把脚本复制到项目根。`tbd` 则先 **sparrow-requirement**；`brownfield` 则停止。`changeId` 为空且 `change/current/` 无未归档目录时停止，请用户执行 **sparrow-requirement**。不要 `set-context`。verify 不是修订，不写 `delta.md`。未指定 slug 时从 `project.md` 列出，可选单个、多个或全部。对每个 slug 执行同一脚本的 `set-context {slug} verify ongoing`。

下一步：读取 `steps/02-language.md`。不要提前打开它。
