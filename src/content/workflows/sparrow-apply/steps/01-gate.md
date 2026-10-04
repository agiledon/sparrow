# 确认状态与 slug

在项目根执行 `node <本 skill 目录>/scripts/sparrow-state.mjs show`。不要把脚本复制到项目根。`tbd` 则先 **sparrow-requirement**；`brownfield` 则停止。`changeId` 为空且 `change/current/` 无未归档目录时停止，请用户执行 **sparrow-requirement**。不要 `set-context`。确定 slug 后，仅当该 slug 出现在 `delta.md` 最新一节的影响范围里时，执行同一脚本的 `set-context {slug} apply ongoing`。未点名的模块不进入本阶段。无 `plan.md` 则先 **sparrow-plan @{slug}**。plan 已全 `[x]` 且该 slug 不在当次影响范围里，则提示 **sparrow-verify @{slug}**。不得在此新起尚未映射的限界上下文。

下一步：读取 `steps/02-context.md`。不要提前打开它。
