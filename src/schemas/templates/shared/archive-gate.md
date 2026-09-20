# Archive gate contract（权威）

本文件为归档完成判定与 promote 命令的**单一叙述源**。实现以 `src/core/archive-readiness.ts` / `src/core/spec-promote.ts` 为准；agent 入口为 `scripts/sparrow-state.mjs` 与 `scripts/sparrow-promote.mjs`。

## Slug 完成判定

```text
pipeline.contexts[slug].current-step === "verify"
AND pipeline.contexts[slug].status === "done"
```

Slug 清单 = `pipeline.contexts` keys ∪ `change/current/{change-id}/design/*`。仅有目录无 state → **未完成**。

查询：`node scripts/sparrow-state.mjs check-archive [change-id]`

## 归档形态

| 形态 | 条件 | 行为 |
|------|------|------|
| 完整 | 全部 slug 完成 | 整目录移至 `archive/{synced-at}-{id}/` → promote → `archive-done` |
| 部分 | 有未完成且用户坚持 | 仅共享物 + 已完成 `design/{slug}/` 入 archive；promote 带 `--slugs`；`prune-contexts`；**保留** changeId |
| 禁止 | 无已完成 slug | 不得归档 |

## Promote（必做、append-only）

```text
node scripts/sparrow-promote.mjs <change-id> <synced-at> [--source archive|current] [--folder <name>] [--slugs a,b]
```

- **ADDED**：新建；**MODIFIED**：文末追加 delta；**REMOVED**：仅记历史，不删 master 文件
- 排除 `proposal.md`、`design/{slug}/plan.md`
- 历史按 `### shared` / `### slug: {slug}` 分组写入 requirement/design revision-history
