# revise 门控

仅在**检测到活动变更**时进入增量路径。否则忽略 revise，按 SKILL.md 主流程 + 存在性检查（skip / overwrite / update）执行。

活动变更存在，当且仅当满足以下任一：

- `docs/sparrow/change/current/` 含未归档变更文件夹（未归档 = 不在 `change/archive/` 下）
- `change/current/{activeChangeId}/project.md` 的「变更管理」块中「当前活动 change-id」非空

满足 → 读取 `proposal.md`，对已有产物做增量而非无差别全量重写。档位表与重构动作的权威定义在 **sparrow-architecture** 的 `references/bc-tiers.md`。下游阶段按档位决定是否重跑。

完整约定见 `docs/prd/sparrow-change-management.md`。
