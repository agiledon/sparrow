# 更新项目向导

读 `references/project-md-update.md` 与 `references/revise-gate.md`：为每个 slug 添加 spec/api/tech/model/plan 索引；交互上下文标注 `— *交互上下文*`。按对账格式追加 `delta.md` 一节，并更新「变更管理」块的当前修订号。更下游只标过期，不在本步重跑 design、model、plan、apply，不改 `backend/`。在项目根执行 `node <本 skill 目录>/scripts/sparrow-state.mjs set-step architecture done`。不要把脚本复制到项目根。

本阶段结束。
