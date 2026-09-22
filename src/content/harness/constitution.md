# Sparrow 约束资产宪法（Harness Constitution）

> 本文件是 Sparrow DDD 框架的**约束资产聚合索引**。它不重复各纪律文件的具体条文，只说明加载顺序、优先级与文件位置。

## 加载规则

1. **合并加载（schema `globalHarness`）**：
   - **always**：每个命令**必须**先加载 `globalHarness.always`（含本文件），再加载该阶段 `step.harness` 中的专项文件。
   - **conditional**：当条件满足时**必须额外**加载 `globalHarness.conditional` 中对应文件（见各 skill「约束资产」章节的条件说明）。
2. **优先级**：项目级（\`docs/sparrow/harness/\`）> 全局级（全局配置目录下的 harness）。冲突以项目级为准。
3. **无项目级文件时**：使用全局级同名路径。
4. **约束性质**：约束资产是各 stage skill 的行为基准；skill 正文与约束冲突时**以约束资产为准**。

## 通用约束索引（`common/`）

| 类型 | 路径 | 说明 |
|------|------|------|
| always | `common/always/interactive-interaction.md` | 互动式交互纪律（逐题确认） |
| always | `common/always/document-language.md` | 文档交付物语言（`sparrow-config.json` 的 `lang`） |
| conditional | `common/conditional/brownfield.md` | 当 `.sparrow/sparrow-state.json` 的 `development-mode` 为 `brownfield` |

目录约定见 `common/README.md`。新增跨阶段纪律：放入 `common/always/` 或 `common/conditional/`，更新 `schema.yaml` 的 `globalHarness` 与本表（**仅指针**）。

## 阶段专项约束索引

| 阶段 | 命令 | 约束文件（`step.harness`） | 说明 |
|------|------|---------------------------|------|
| 需求 | sparrow-requirement | requirement/requirements.md | 分层需求、EBP 覆盖、业务服务（EARS）、UI 操作流程 |
| 需求 | sparrow-requirement | requirement/subdomains.md | 子领域划分（问题空间） |
| 限界上下文 | sparrow-arch | arch/bounded-contexts.md | SD→BC 映射与上下文通信 |
| 规格切片 | sparrow-arch | arch/spec-slice.md | BS 薄投影与 Property |
| 前端架构（可选） | sparrow-arch（前端） | arch/frontend.md | 交互上下文 |
| API 设计 | sparrow-design | design/api-design.md | 服务契约与 API |
| 领域建模 | sparrow-model | model/architecture.md | DDD 四层与角色构造型 |
| 领域建模 | sparrow-model | model/domain-modeling.md | 静态/动态建模与 OOP |
| 领域建模 | sparrow-model | model/view-modeling.md | View Model（有 UI 时） |
| 代码实现 | sparrow-apply / verify | apply/implementation.md | 代码生成与封装 |

## 通用纪律（指针）

执行前须加载并遵守对应文件；**本处不展开 Must/Not 全文**。

| # | 主题 | 权威文件 |
|---|------|----------|
| 1 | 约束资产优先 | 本文件「加载规则」 |
| 2 | 统一语言 | （待扩展时可新增 `common/always/ubiquitous-language.md`） |
| 3 | 依赖方向 | 阶段专项 harness（如 model/architecture.md） |
| 4 | 版本元数据 | 各 skill「版本元数据管理」章节 |
| 5 | 互动式交互 | `common/always/interactive-interaction.md` |
| 6 | 活动变更 ID 命名与确认 | `requirement/requirements.md`「活动变更 ID 确认纪律」 |

## 维护方式

- **全局**：`sparrow init` / `sparrow update` 写入全局配置目录；受管模板可随版本刷新，用户去掉 managed 标记的编辑不会被覆盖。
- **项目级**：`docs/sparrow/harness/` 占位可覆盖全局；通过 `/sparrow-supporting-harness` 维护。
