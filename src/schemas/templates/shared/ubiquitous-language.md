# 统一语言

各 skill 使用下列术语，禁止另造同义词。

## 流水线与工作区

| 术语 | 含义 |
|------|------|
| master | `docs/sparrow/master/`。已发布基线，只读。init 后为空目录；首次 archive 前禁止写入。 |
| change | `docs/sparrow/change/`。含 `current/` 与 `archive/`。 |
| current | `docs/sparrow/change/current/`。活动变更工作区的父目录。init 后为空；无 change-id 时保持为空。 |
| change-id | kebab-case 变更标识。确认后才创建 `change/current/{change-id}/`。 |
| activeChangeId | `.sparrow/sparrow-state.json` 的 `active-change.changeId`；若为空且 `current/` 仅有一个子目录，则用该目录名。 |
| archive | `docs/sparrow/change/archive/YYYY-MM-DD-{changeId}/`。归档快照。 |
| development-mode | `.sparrow/sparrow-state.json` 的 `tbd` \| `greenfield` \| `iteration` \| `brownfield`。`tbd` 表示尚未探测；此时 `pipeline` 必须为空。proposal.md 只抄写该值。 |
| pipeline | `.sparrow/sparrow-state.json` 的阶段进度：`current-step` + `status`（`ongoing` \| `done`）；团队级另有 `contexts.<slug>`。 |
| slug | 限界上下文或交互上下文的英文目录名，位于 `design/{slug}/`。 |
| 全局级 harness | `~/.config/sparrow/harness/`（Windows：`%APPDATA%/sparrow/harness/`）。框架维护的 DDD 纪律。 |
| 项目级 harness | `docs/sparrow/harness/`。本项目约束，优先级高于全局级。 |
| common harness | harness 下的 `common/`：跨阶段纪律（always / conditional）。不是「全局级」的同义词。 |
| Grill Me | 决策访谈：每次一问、给推荐答案、收敛后再行动。互动纪律见 harness `common/always/interactive-interaction.md`。维度与顺序见 `grill-me.md`。 |
| project.md（change） | `change/current/{id}/project.md`。工作区向导索引。 |
| project.md（master） | `docs/sparrow/master/project.md`。promote 后的基线索引。 |
| sparrow-config.json | `.sparrow/sparrow-config.json`。工具列表、项目名、版本、plugins、`lang`（文档语言，BCP 47；缺省 `zh-Hans`）。 |
| sparrow-state.json | `.sparrow/sparrow-state.json`。流水线状态源。 |

## 问题空间（requirement）

| 术语 | 英文 | 缩写 | 含义 |
|------|------|------|------|
| 领域 | domain | D | 整产品对应的问题域；通常不单独落文件。 |
| 子领域 | subdomain | SD | L1 战略分区（Core / Supporting / Generic）。目录 `requirement/business/{sd-slug}/`，规格文件 `subdomain.md`。 |
| 能力 | capability | C | L2「能做什么」；超过阈值时目录 `{sd-slug}/{c-slug}/capability.md`，否则省略该层。 |
| 场景 | scenario | S | L3 业务场景，采用 5W（Who/Why/When/What/Where）。**仅用于问题空间**。文件 `…/{s-slug}/scenario.md`。 |
| 业务服务 | business service | BS | L4；一次请求 = 一个服务；验收标准用 EARS。同一场景全部 BS 写入该场景的 `business-services.md`。 |
| 端到端业务流程 | end-to-end business process | EBP | 交付完整业务结果的有序步骤链；每个需系统处理的步骤对应一个 BS；索引写入 `catalog.md`。 |
| 端到端操作流程 | end-to-end operation flow | — | 由 EBP 转换的 UI 操作序列；驱动页面识别，禁止另起脱节旅程。 |

ID 前缀：`SD-*`、`C-*`、`S-*`、`BS-*`、`EBP-*`。

## 解空间（arch 及下游）

| 术语 | 英文 | 缩写 | 含义 |
|------|------|------|------|
| 限界上下文 | bounded context | BC | 后端解空间边界；先由 SD 一对一映射，再识别调整。 |
| 交互上下文 | interaction context | — | 与 BC 同级的前端+BFF 上下文；`project.md` 中标注 `— *交互上下文*`。 |
| 属性 | property | P | 从 EARS 抽取的普遍量化命题/不变量；挂在 BC 内某 BS 下。 |

ID 前缀：`P-*`；BC 用 slug（目录名）。

**禁止**：用「业务架构」「应用架构」指代产出物；在解空间用「scenario」指代验收片段（与问题空间 S 撞名）。
