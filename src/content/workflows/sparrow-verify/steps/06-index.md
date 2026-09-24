# 更新项目向导

读 `references/project-md-update.md`。该 slug 无 P0/P1 时 `set-context {slug} verify done`。

- 存在 P0 或 P1：列出阻塞项，不提示 archive；修复后重新 verify。
- 无 P0/P1：该 slug 通过。全部相关 slug 通过后，revise 模式执行 **sparrow-archive**。
