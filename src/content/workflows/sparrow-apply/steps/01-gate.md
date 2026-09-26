# 确认状态与 slug

在项目根执行 `node <本 skill 目录>/scripts/sparrow-state.mjs show`。不要把脚本复制到项目根。`tbd` 则先 **sparrow-requirement**；`brownfield` 则停止。确定 slug 后执行同一脚本的 `set-context {slug} apply ongoing`。无 `plan.md` 则先 **sparrow-plan @{slug}**。plan 已全 `[x]` 则提示 **sparrow-verify @{slug}**。

下一步：读取 `steps/02-context.md`。不要提前打开它。
