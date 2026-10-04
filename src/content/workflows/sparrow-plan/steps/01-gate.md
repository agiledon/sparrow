# 确认状态与 slug

在项目根执行 `node <本 skill 目录>/scripts/sparrow-state.mjs show`。不要把脚本复制到项目根。`tbd` 则先 **sparrow-requirement**；`brownfield` 则停止。`changeId` 为空且 `change/current/` 无未归档目录时停止，请用户执行 **sparrow-requirement**。不要 `set-context`。确定 slug 后执行同一脚本的 `set-context {slug} plan ongoing`。缺 spec/api/tech/model 则提示补齐。本次修订当前 change，不新建 change-id。不得在此新起尚未映射的限界上下文。

下一步：读取 `steps/02-context.md`。不要提前打开它。
