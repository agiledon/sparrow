# 更新项目向导

读 `references/project-md-update.md` 与 `references/revise-gate.md`。按对账格式追加 `delta.md` 一节，并更新「变更管理」块的当前修订号。代码改动只限当次影响范围里点名的 `backend/{slug}/`。在项目根执行 `node <本 skill 目录>/scripts/sparrow-state.mjs set-context {slug} apply done`。不要把脚本复制到项目根。

本阶段结束。
