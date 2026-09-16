# 统一语言

各 skill 使用下列术语，禁止另造同义词。

| 术语 | 含义 |
|------|------|
| master | `docs/sparrow/master/`。已发布基线，只读。init 后为空目录；首次 archive 前禁止写入。 |
| change | `docs/sparrow/change/`。含 `current/` 与 `archive/`。 |
| current | `docs/sparrow/change/current/`。活动变更工作区的父目录。init 后为空；无 change-id 时保持为空。 |
| change-id | kebab-case 变更标识。确认后才创建 `change/current/{change-id}/`。 |
| activeChangeId | `.sparrow/active-change.json` 的 `changeId`；若为空且 `current/` 仅有一个子目录，则用该目录名。 |
| archive | `docs/sparrow/change/archive/YYYY-MM-DD-{changeId}/`。归档快照。 |
| development-mode | `proposal.md` 中的 `greenfield` \| `iteration` \| `brownfield`。 |
| slug | 限界上下文或交互上下文的英文目录名，位于 `design/{slug}/`。 |
| BC | 后端限界上下文。 |
| 交互上下文 | 与 BC 同级的前端+BFF 上下文；`project.md` 中标注 `— *交互上下文*`。 |
| 全局级 harness | `~/.config/sparrow/harness/`（Windows：`%APPDATA%/sparrow/harness/`）。框架维护的 DDD 纪律。 |
| 项目级 harness | `docs/sparrow/harness/`。本项目约束，优先级高于全局级。 |
| common harness | harness 下的 `common/`：跨阶段纪律（always / conditional）。不是「全局级」的同义词。 |
| Grill Me | 决策访谈：每次一问、给推荐答案、收敛后再行动。互动纪律见 harness `common/always/interactive-interaction.md`。 |
| project.md（change） | `change/current/{id}/project.md`。工作区向导索引。 |
| project.md（master） | `docs/sparrow/master/project.md`。promote 后的基线索引。 |
