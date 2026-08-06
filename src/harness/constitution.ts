/**
 * Harness constitution — aggregate index of all stage constraint assets.
 *
 * The constitution does not repeat per-stage rules. It tells the AI which
 * constraint files to load per stage, how precedence works, and how to
 * maintain the constraint assets.
 */

export const CONSTITUTION_BODY = `# Sparrow 约束资产宪法（Harness Constitution）

> 本文件是 Sparrow DDD 框架的**约束资产聚合索引**。它不重复各阶段的具体规则，而是说明：
> 每个阶段必须加载哪些约束文件、优先级如何、以及如何维护这些约束资产。

## 加载规则

1. **按阶段加载**：每个阶段命令（sparrow-explore / sparrow-arch / sparrow-design / sparrow-model / sparrow-plan / sparrow-apply）只加载与自身阶段对应的约束文件，不加载全部。
2. **优先级**：项目级约束（\`docs/sparrow/harness/\`） > 全局约束（全局配置目录下的 harness）。内容冲突时以项目级为准。
3. **无项目级文件时**：直接使用全局级约束。
4. **约束性质**：约束资产定义"必须做什么 / 禁止做什么"的纪律，是各阶段 skill 的行为基准。skill 中若与约束资产冲突，**以约束资产为准**。

## 阶段 → 约束文件索引

| 阶段 | 命令 | 约束文件 | 说明 |
|------|------|---------|------|
| 需求探索 | sparrow-explore | explore/requirements.md | 业务服务识别与需求文档纪律 |
| 业务架构 | sparrow-arch（阶段一） | arch/business.md | 子领域划分纪律 |
| 应用架构 | sparrow-arch（阶段二） | arch/application.md | 限界上下文与通信纪律 |
| API 设计 | sparrow-design | design/api-design.md | 服务契约与 API 定义纪律 |
| 领域建模 | sparrow-model | model/architecture.md | DDD 四层结构与角色构造型纪律 |
| 领域建模 | sparrow-model | model/domain-modeling.md | 静态/动态建模与 OOP 纪律 |
| 代码实现 | sparrow-apply | apply/implementation.md | 代码生成与封装纪律 |

## 全局通用纪律（所有阶段适用）

1. **必须遵守约束资产**：每个阶段执行前，必须先加载对应约束文件并逐条自检。
2. **必须使用统一语言（Ubiquitous Language）**：所有产物（需求、架构、设计、模型、代码）中同一概念必须使用同一术语。
3. **必须遵循依赖方向**：依赖只能从外层指向内层（api / application / infrastructure → domain），领域层不依赖任何外层。
4. **必须维护版本元数据**：所有生成/修改的文档必须携带版本元数据块。

## 维护方式

- **全局约束**：由 Sparrow 安装时写入全局配置目录，\`sparrow update\` 在有更新时同步。全局约束为 DDD 通用纪律，一般无需修改。
- **项目级约束**：\`sparrow init\` 预生成占位文件，可自由添加本项目特有的约束。项目级约束覆盖全局约束。
- 修改后，对**后续**的阶段命令即时生效。`;
