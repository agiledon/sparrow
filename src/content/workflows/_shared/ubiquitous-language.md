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
| development-mode | `.sparrow/sparrow-state.json` 的 `tbd` \| `greenfield` \| `increment`（增量） \| `brownfield`。`tbd` 表示尚未探测；此时 `pipeline` 必须为空。proposal.md 只抄写该值。读到旧值 `iteration` 时按 `increment` 处理。 |
| pipeline | `.sparrow/sparrow-state.json` 的阶段进度：`current-step` + `status`（`ongoing` \| `done`）；团队级另有 `contexts.<slug>`。 |
| slug | 限界上下文（Bounded Context）或交互上下文的英文目录名，位于 `design/{slug}/`。 |
| 全局级 harness | `~/.config/sparrow/harness/`（Windows：`%APPDATA%/sparrow/harness/`）。框架维护的 DDD 纪律。 |
| 项目级 harness | `docs/sparrow/harness/`。本项目约束，优先级高于全局级。 |
| common harness | harness 下的 `common/`：跨阶段纪律（always / conditional）。不是「全局级」的同义词。 |
| Grill Me | 决策访谈：每次一问、给推荐答案、收敛后再行动。互动纪律见 harness `common/always/interactive-interaction.md`。需求探索顺序见 harness `requirement/requirements.md`「需求结构 V 模型」，展开见 `grill-me.md`。 |
| project.md（change） | `change/current/{id}/project.md`。工作区向导索引。 |
| project.md（master） | `docs/sparrow/master/project.md`。promote 后的基线索引。 |
| sparrow-config.json | `.sparrow/sparrow-config.json`。工具列表、项目名、版本、plugins（`enabled: false` 禁用该插件）、`lang`（文档语言，BCP 47；缺省 `zh-Hans`）。 |
| sparrow-state.json | `.sparrow/sparrow-state.json`。流水线状态源。 |

## 问题空间（requirement）

| 术语 | 英文 | 缩写 | 含义 |
|------|------|------|------|
| 利益相关者（Stakeholder） | stakeholder | — | 先识别利益相关者，再确定参与者，包括外部客户和内部用户。 |
| 价值流（Value Stream） | value stream | — | 一组端到端活动，为外部客户或内部用户创造一个有价值的结果。写入 `catalog.md`，并作为端到端业务流程的分组。不单独建文件。 |
| 领域 | domain | D | 整产品对应的问题域；通常不单独落文件。 |
| 子领域（Subdomain） | subdomain | SD | L1。从业务问题和目标归纳（两层时直接由业务服务归纳）。类别为核心（Core）、支撑（Supporting）或通用（Generic）。目录 `requirement/business/{sd-slug}/`，规格文件 `subdomain.md`。 |
| 问题空间复杂度阈值（Problem-space Complexity Threshold） | problem-space complexity threshold | — | 决定落两层还是四层。当前取值只写在 harness `requirement/requirements.md`「问题空间复杂度阈值」。其它文档不重复该数字。 |
| 能力（Capability） | capability | C | L2。仅当达到问题空间复杂度阈值时，由场景归纳并写入 `{sd-slug}/{c-slug}/capability.md`。 |
| 场景（Scenario） | scenario | S | L3。仅四层时使用场景五问，文件 `{sd-slug}/{c-slug}/{s-slug}/scenario.md`。**仅用于问题空间**。 |
| 业务服务（Business Service） | business service | BS | L4；一次请求 = 一个服务；验收标准用中文句式。未达问题空间复杂度阈值时写入 `{sd-slug}/business-services.md`；达到该阈值时写入该场景目录的 `business-services.md`。 |
| 端到端业务流程 | end-to-end business process | EBP | 从参与系统的利益相关者出发、在价值流指导下整理的旅程；每个需系统处理的步骤对应一个业务服务；索引写入 `catalog.md`。 |
| 端到端操作流程 | end-to-end operation flow | — | 由 EBP 转换的 UI 操作序列；驱动页面识别，禁止另起脱节旅程。 |

ID 前缀：`SD-*`、`C-*`、`S-*`、`BS-*`、`EBP-*`。

## 解空间（arch 及下游）

| 术语 | 英文 | 缩写 | 含义 |
|------|------|------|------|
| 限界上下文 | bounded context | BC | 后端解空间边界；先由子领域一对一映射，再识别调整。正文不写 `BC`，编号用 slug。 |
| 交互上下文 | interaction context | — | 与限界上下文同级的前端+BFF 上下文；`project.md` 中标注 `— *交互上下文*`。 |
| 属性 | property | P | 从验收标准抽取的普遍量化命题/不变量；挂在限界上下文内某业务服务下。 |

ID 前缀：`P-*`。限界上下文用 slug（目录名），正文不写 `BC`。

**禁止**：用「业务架构」「应用架构」指代产出物；在解空间用「场景」指代验收片段（与问题空间的场景编号 `S-*` 撞名）。
