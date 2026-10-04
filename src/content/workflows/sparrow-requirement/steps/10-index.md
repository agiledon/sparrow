# 更新项目向导

读 `references/project-md-update.md`、`references/version-metadata.md` 与 `references/revise-gate.md`。按对账格式追加 `delta.md` 一节（影响范围 + 四种 Delta），并把 `project.md`「变更管理」块更新为当前修订号与该文件链接。§1.2 只勾选 catalog；不在此步才首次创建 `project.md`。不改 `backend/`。

在项目根执行 `node <本 skill 目录>/scripts/sparrow-state.mjs set-step requirement done`。不要把脚本复制到项目根。

本阶段结束。不要再打开未使用的模板。
