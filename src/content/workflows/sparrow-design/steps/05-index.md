# 更新项目向导

读 `references/project-md-update.md` 与 `references/revise-gate.md`，更新该 slug 的 api/tech 状态。按对账格式追加 `delta.md` 一节，并更新「变更管理」块的当前修订号。不改 `backend/`，不自动重跑 model、plan、apply。在项目根执行 `node <本 skill 目录>/scripts/sparrow-state.mjs set-context {slug} design done`。不要把脚本复制到项目根。

本阶段结束。
