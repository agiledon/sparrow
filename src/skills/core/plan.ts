/**
 * Sparrow Plan skill template.
 *
 * This skill creates an implementation plan based on spec, api, tech, and model documents.
 */

import type { SkillSpec } from '../../core/skills.js';

const PLAN_BODY = `# Sparrow Plan — 实现计划制订

## 执行顺序检查

\`\`\`
当前步骤：sparrow-plan（第 5 步 / 共 8 步）
所属层级：团队级（team-level），针对特定限界上下文或交互上下文
前置条件（必须全部存在）：
  1. docs/sparrow/design/{slug}/spec.md
  2. docs/sparrow/design/{slug}/api.md
  3. docs/sparrow/design/{slug}/tech.md
  4. docs/sparrow/design/{slug}/model.md
下一步骤：sparrow-apply @{slug}（第 6 步）→ sparrow-verify @{slug}（第 7 步）
\`\`\`

**前置条件检查**：
- 如果上述任一前置文件不存在，请提示用户缺少哪个文件，以及需要先执行什么步骤
- 如果用户未指定 slug，请列出可用的 slug 让用户选择（从 project.md 中读取）
- 如果目标文件已存在，请参考下方"输出文件存在性检查"章节处理

### Slug 类型判定

1. 读取 \`docs/sparrow/project.md\` 的「限界上下文设计」部分
2. 如果当前 slug 标注了 **— *交互上下文*** 标记 → 执行下方「交互上下文实现计划」章节
3. 否则 → 执行下方「后端限界上下文实现计划」章节（保持现有逻辑）

---

## 🛑 输出文件存在性检查（必须在生成前执行）

在开始生成内容之前，请检查以下输出文件是否已经存在：

- \`docs/sparrow/design/{slug}/plan.md\`

如果文件已存在，请**让用户进行选择**：

- **跳过 (skip)**：保留已有文件，不执行任何生成操作，停止执行
- **覆盖 (overwrite)**：删除已有文件，重新生成全新的内容
- **更新 (update)**：在已有文件基础上进行修改和完善

> ⚠️ 一次命令只确认一次，用户的选择应用于所有输出文件。

---

## 变更模式（revise）— 按 BC 档位按需重生成

> **⚠️ 门控声明（向后兼容硬性约束）**：本节仅在**检测到活动变更**时进入。**若当前为首次需求、无活动变更，请忽略本节，完全按上文原始流程（输出文件存在性检查 skip/overwrite/update）执行，行为须与未引入本节前完全一致。**

**触发条件**（同 sparrow-arch「变更处理 / revise」章节）：\`docs/sparrow/changes/\` 含未归档变更文件夹，或 \`project.md\` 当前 change-id 非空。

**revise 行为**：
1. 从 \`project.md\`「变更管理」块读取本次变更的**受影响 slug 列表**。
2. 对每个受影响 slug，依据其档位（S0–S4，见 sparrow-arch）判断是否在本阶段处理：
   - **plan 阶段处理条件**：档位 ≥ S3（即 plan 已生成）
   - 不满足则跳过该 slug
3. 满足条件的 slug：在现有 \`plan.md\` 基础上，按 \`changes/{change-id}/deltas/design/{slug}/plan.md\`（若有）做增量更新或重生成（沿用存在性检查的 update 语义），版本号递增并追加 \`change-id\` 到元数据块。
4. 未受影响的 slug 不处理。

> 仅 S0–S2 档位的 BC 不会到达 plan，本阶段不参与。

---

## 📋 project.md 更新

完成输出后，**必须**更新 \`docs/sparrow/project.md\`：

1. 如果 \`project.md\` 不存在，根据当前项目信息创建它
2. 在"限界上下文设计"部分，找到当前 \`{slug}\` 的子章节
3. 更新 \`plan.md\` 的状态从 \`_待生成_\` 改为 \`_v{version}_\`
4. 更新文件头部的"最后更新"时间戳

**project.md 路径**: \`docs/sparrow/project.md\`

---

## 📌 版本元数据管理

所有输出的文档文件**必须在文件开头**包含版本元数据块：

\`\`\`markdown
<!--
  version: v1.0
  last-updated: {ISO_8601_TIMESTAMP}
  generated-by: sparrow-plan
  sparrow-version: {从 .sparrow/sparrow.json 读取}
-->
\`\`\`

**版本规则**:
- **新文档**: 使用 \`v1.0\`
- **更新已有文档**: 读取现有版本号，递增次版本号（\`v1.0\` → \`v1.1\`）
- **重大重写**: 递增主版本号（\`v1.x\` → \`v2.0\`）
- 每次修改都**必须变更**版本号

**操作步骤**:
1. 检查目标文件是否已存在
2. 如果存在，读取文件开头 \`<!--\` 注释块中的 \`version:\` 字段并递增
3. 在文件开头添加或更新版本元数据块
4. 继续生成文档正文

> **revise 模式扩展（仅活动变更时）**：当处于 revise 模式（判定见 sparrow-arch「变更处理 / revise」章节）更新已有文档时，在元数据块**追加可选字段** \`change-id: {change-id}\`（必要时加 \`supersedes: {被取代版本}\`）。基线（无活动变更）**不追加**这些字段，输出与未引入前一致。

---

## 代码目录

产品代码根目录统一使用 **\`backend/\`**。多个限界上下文共享 \`backend/\` 目录，各上下文为该代码项目下的不同包/模块。

> \`backend/\` 目录在首次执行 sparrow-apply 时自动创建。

---

## 角色定义

你是一名 **Planner**，负责读取当前限界上下文的所有设计文档，经推理后输出实现计划。

## 必读输入

- \`docs/sparrow/design/{slug}/spec.md\` — 场景与验收
- \`docs/sparrow/design/{slug}/api.md\` — 对外契约
- \`docs/sparrow/design/{slug}/tech.md\` — 技术栈与工具链
- \`docs/sparrow/design/{slug}/model.md\` — 领域静态/动态模型

## 输出

写入 **\`docs/sparrow/design/{slug}/plan.md\`**

---

## 任务（Task）格式

每个任务使用二级标题引入，标题必须以 \`## 任务\` 开头：

\`\`\`markdown
## 任务 1：{任务标题}

**执行方**：\`dev\`（产品代码，含领域层 TDD）或 \`qa\`（仅集成/API 测试）
**可并行**：\`否\`（是否可与其他标记为"可并行：是"的任务并行执行）

### 步骤

- [ ] 第一步说明
- [ ] 第二步说明
\`\`\`

### 执行方说明

- **\`qa\`**：集成测试、API/契约测试等，写入 \`integration-tests/{slug}/\`，**不得包含领域层单元测试**
- **\`dev\`**：产品模块下 DDD 四层与领域 TDD（单元测试与产品代码均在产品模块内）

### 聚合粒度与步骤合并

- 同一聚合根的领域层实现应尽量写在同一 \`- [ ]\` 步骤中
- 禁止为同一聚合拆成「先写测试」「再写实现」「再写值对象」等多条独立 checklist
- 不同聚合、或产品代码与集成测试之间可分任务

---

## 任务排序规则（DDD 分层依赖）

任务排列顺序必须遵循 DDD 分层依赖关系，从内层向外层：

| 顺序 | 层次 | 内容 |
|------|------|------|
| 1 | **脚手架 + 依赖** | 项目初始化、构建脚本、依赖声明 |
| 2 | **领域层** | domain/aggregate、entity、valueobject、service |
| 3 | **基础设施层** | infrastructure/port/ + adapter/，以及数据库 / schema / 迁移脚本（见「持久化与数据库迁移纪律」） |
| 4 | **应用层** | application/（AppService） |
| 5 | **api 层** | api/dto、api/command、api/query |

---

## 代码模块布局

### 核心原则

- **一个限界上下文 = 一个产品模块**，根目录为 **\`backend/\`**
- 四层（api、application、domain、infrastructure）以包/目录划分
- **集成/API 测试**在 **\`integration-tests/{slug}/\`** 下
- **数据库迁移脚本**置于版本化迁移目录（由所选迁移工具约定，如 JVM 项目 \`src/main/resources/db/migration/\`）
- **禁止**将各层拆为 Maven/npm/Cargo 子模块

### 跨语言 DDD 四层布局

将以下目录结构应用到 plan 中的步骤描述：

**Java (Maven)**：
\`\`\`
backend/
  src/main/java/{basePackage}/
    api/command/
    api/query/
    api/dto/
    application/
    domain/aggregate/
    domain/entity/
    domain/valueobject/
    domain/service/
    infrastructure/port/repository/
    infrastructure/port/client/
    infrastructure/adapter/repository/
    infrastructure/adapter/client/
  src/test/java/{basePackage}/
    domain/...
\`\`\`

**Python (uv/pip)**：
\`\`\`
backend/
  {package}/api/command/
  {package}/api/query/
  {package}/api/dto/
  {package}/application/
  {package}/domain/aggregate/
  {package}/domain/entity/
  {package}/domain/valueobject/
  {package}/domain/service/
  {package}/infrastructure/port/repository/
  {package}/infrastructure/port/client/
  {package}/infrastructure/adapter/repository/
  {package}/infrastructure/adapter/client/
  tests/{package}/domain/...
\`\`\`

**Node.js (TypeScript)**：
\`\`\`
backend/
  src/api/command/
  src/api/query/
  src/api/dto/
  src/application/
  src/domain/aggregate/
  src/domain/entity/
  src/domain/valueobject/
  src/domain/service/
  src/infrastructure/port/repository/
  src/infrastructure/port/client/
  src/infrastructure/adapter/repository/
  src/infrastructure/adapter/client/
  tests/domain/...
\`\`\`

**Go**：
\`\`\`
backend/
  cmd/
  internal/api/command/
  internal/api/query/
  internal/api/dto/
  internal/application/
  internal/domain/aggregate/
  internal/domain/entity/
  internal/domain/valueobject/
  internal/domain/service/
  internal/infrastructure/port/repository/
  internal/infrastructure/port/client/
  internal/infrastructure/adapter/repository/
  internal/infrastructure/adapter/client/
\`\`\`

**Rust**：
\`\`\`
backend/
  src/api/command/
  src/api/query/
  src/api/dto/
  src/application/
  src/domain/aggregate/
  src/domain/entity/
  src/domain/valueobject/
  src/domain/service/
  src/infrastructure/port/repository/
  src/infrastructure/port/client/
  src/infrastructure/adapter/repository/
  src/infrastructure/adapter/client/
  src/lib.rs
  tests/
\`\`\`

**C++ (CMake + Conan/vcpkg)**：
\`\`\`
backend/
  src/api/command/
  src/api/query/
  src/api/dto/
  src/application/
  src/domain/aggregate/
  src/domain/entity/
  src/domain/valueobject/
  src/domain/service/
  src/infrastructure/port/repository/
  src/infrastructure/port/client/
  src/infrastructure/adapter/repository/
  src/infrastructure/adapter/client/
  tests/
  CMakeLists.txt
\`\`\`

---

## 持久化与数据库迁移纪律

> 数据库 / schema / 迁移脚本属于**基础设施层**，必须在领域层（聚合、实体、值对象）建模完成后开展。

1. **领域模型先行**：先有领域模型，才有数据模型。数据库（database）、schema 与表结构必须**由领域模型（聚合、实体、值对象）推导而来**，并与之一致；禁止脱离领域模型凭空设计表结构。
2. **数据库与 schema 创建**：plan 必须包含创建数据库（\`CREATE DATABASE\`）与 schema（\`CREATE SCHEMA\`）的任务；数据库名、schema 名及隔离策略须与 \`tech.md\` 的技术选型一致（如「每 BC 独立 schema」）。
3. **版本化迁移工具**：数据库结构变更必须使用**版本化迁移工具**（如 Flyway / Liquibase），**禁止手写 DDL 直接执行**；plan 中需明确选用哪个工具及其配置位置。
4. **SQL 脚本版本管理**：迁移脚本按版本命名并递增（如 Flyway 的 \`V1__xxx.sql\`）；每个 schema 变更对应一个新版本脚本，**禁止修改已发布的迁移脚本**。
5. **提供给 apply 的足够信息**：plan 的数据库任务必须写明——数据库名、schema 名、每张表与领域模型（聚合 / 实体 / 值对象）的映射关系、迁移工具与脚本目录、版本命名规则，使 apply 阶段能够据此**正确创建 schema 并正确持久化领域模型**。

---

## 任务完整性检查表

从下列角度自检，避免遗漏：

| 角度 | 应覆盖的典型步骤 |
|------|-----------------|
| spec | 与关键场景对应的实现与验证 |
| api | 契约测试、控制器形状与错误码 |
| model | 聚合/实体/值对象/领域服务与序列图约束 |
| 数据库 / schema / 迁移 | 数据库与 schema 创建、版本化迁移工具与 SQL 脚本版本管理（由领域模型推导） |
| tech | 脚手架、选定测试与构建命令 |
| 集成/API 测试 | 在集成测试目录创建测试工程 |
| 产品代码 | 按聚合合并的领域 TDD、应用层与基础设施 |
| 依赖与构建 | 单独一步写明依赖安装命令 |

---

## 禁止事项

- 不要臆造 api.md / model.md 中不存在的 API 或聚合
- 不要在 plan.md 中嵌入完整大段规约原文
- **禁止**创建按层拆分的 Maven/npm/Cargo 子模块
- **禁止**将集成测试作为产品代码子模块
- **禁止**出现 \`application/command\`、\`application/query\`、\`interfaces/\` 等目录结构
- **禁止**脱离领域模型设计数据库表结构（先有领域模型，才有数据模型）

---

## 示例 Plan 结构

\`\`\`markdown
# 实现计划 — {限界上下文中文名}

本计划覆盖 sparrow-apply 阶段的所有开发与测试任务。

## 任务 1：项目脚手架与依赖配置

**执行方**：\`dev\`
**可并行**：\`否\`

### 步骤

- [ ] 在 backend/ 创建项目脚手架
- [ ] 配置依赖管理文件，安装依赖

## 任务 2：{聚合名}领域模型落地

**执行方**：\`dev\`
**可并行**：\`否\`

### 步骤

- [ ] 实现 {AggregateRoot} 聚合根及其实体、值对象（含领域 TDD）：创建 aggregate、entity、valueobject 目录下的所有文件，包含单元测试
- [ ] 实现 {DomainService} 领域服务及单元测试

## 任务 3：基础设施层实现

**执行方**：\`dev\`
**可并行**：\`否\`

### 步骤

- [ ] 创建数据库与 schema（数据库名 / schema 名与 tech.md 技术选型一致）
- [ ] 配置版本化迁移工具（如 Flyway / Liquibase），建立迁移脚本目录与版本命名约定
- [ ] 依据领域模型编写版本化迁移脚本（如 \`V1__init_schema.sql\`），确保表结构与聚合 / 实体 / 值对象一致
- [ ] 实现 Repository 端口与适配器
- [ ] 实现外部服务 Client 端口与适配器

## 任务 4：应用层实现

**执行方**：\`dev\`
**可并行**：\`否\`

### 步骤

- [ ] 实现 {Entity}AppService 应用服务及单元测试

## 任务 5：API 层实现

**执行方**：\`dev\`
**可并行**：\`否\`

### 步骤

- [ ] 实现 api/dto 消息契约
- [ ] 实现 api/command 命令处理器
- [ ] 实现 api/query 查询处理器

## 任务 6：集成测试

**执行方**：\`qa\`
**可并行**：\`是\`

### 步骤

- [ ] 在 integration-tests/{slug}/ 创建集成测试工程
- [ ] 实现 API 契约测试
- [ ] 实现集成场景测试

## 任务 7：构建验证与评审准备

**执行方**：\`dev\`
**可并行**：\`否\`

### 步骤

- [ ] 运行完整构建与测试套件，确保全部通过
\`\`\`

## 🖥️ 交互上下文实现计划

> 以下内容适用于**交互上下文**。仅当当前 slug 在 project.md 中标注为「交互上下文」时执行。

### 任务组织原则

1. **以页面/交互上下文的用户旅程为粒度**，不以 BC 为粒度
2. 任务按"基础设施 → BFF → 页面 → 集成"的顺序排列
3. 同一页面内的前后端任务可以标注并行

### 实现计划模板

\`\`\`markdown
# {交互上下文中文名称} 实现计划

## 任务 1：前端项目脚手架

**执行方**：\`dev\`
**可并行**：\`否\`

- [ ] 创建 frontend/ 项目结构
- [ ] 配置构建工具（{构建工具}）
- [ ] 初始化 UI 组件库和设计令牌
- [ ] 配置路由框架
- [ ] 配置状态管理

## 任务 2：BFF 聚合层脚手架

**执行方**：\`dev\`
**可并行**：\`是\`（可与任务 1 并行）

- [ ] 创建 edge/bff/ 项目结构
- [ ] 配置 BFF 运行时（{BFF 技术栈}）
- [ ] 配置 HTTP 客户端
- [ ] 定义 BFF 南向网关 port 接口（依据契约绑定表）

## 任务 3：BC API 契约桩（MockClient）

**执行方**：\`dev\`
**可并行**：\`是\`（可与任务 1/2 并行）

- [ ] 依据契约绑定表为每个下游 BC API 生成 MockClient（fixture）
- [ ] 依据项目级 \`docs/sparrow/api.md\` 预留 RealClient 端点映射（ACL）
- [ ] 配置装配层切换开关（如 \`BC_ADAPTER=mock|real\`）

## 任务 4：共享组件开发

**执行方**：\`dev\`
**可并行**：\`是\`（可与任务 5 并行）

- [ ] 实现共享 UI 组件（根据 component-library.md）
- [ ] 实现全局样式

## 任务 5：页面模块开发 — {页面名称1}

**执行方**：\`dev\`
**可并行**：\`是\`（不同页面可并行开发）

- [ ] 创建 {PageName} 页面组件
- [ ] 实现 {ChildComponent} 子组件
- [ ] 实现 {BFF endpoint} BFF 聚合端点
- [ ] 实现 ViewModel 适配器（{VMName} ↔ BFF 响应映射）
- [ ] 实现前端服务层（调用 BFF 端点）
- [ ] 实现状态管理

## 任务 6：页面模块开发 — {页面名称2}
...

## 任务 7：集成测试

**执行方**：\`qa\`

- [ ] BFF 端点契约测试（基于 MockClient）
- [ ] 页面组件交互测试
- [ ] E2E 关键用户旅程测试（基于桩）

## 任务 8：契约桩切换（联调）

**执行方**：\`dev\`
**依赖**：本交互上下文聚合的所有目标 BC 的 apply 均完成（其公开 API 已进项目级 \`docs/sparrow/api.md\`）
**可并行**：\`否\`（跨上下文串行，排在最后）

- [ ] 运行契约测试，验证真实 BC 实现满足契约绑定表
- [ ] 通过后切换 \`BC_ADAPTER=real\`，装配 RealClient
- [ ] 验证无残留桩（MockClient 未在生产启用）

## 任务 9：构建验证与评审准备

**执行方**：\`dev\`

- [ ] 运行完整构建与测试套件
\`\`\`

### 并行标记规则

- \`[P]\` 标记：可独立并行执行的任务
- 不同页面模块天然可并行
- BFF 聚合端点开发可与其调用的页面模块并行
- **契约桩切换（联调）是唯一的跨上下文串行节点**：依赖所有目标 BC 完成，排在最后

## 完成后的下一步

✅ 完成 sparrow-plan @{slug} 后，请执行 **sparrow-apply @{slug}**（第 6 步）—— 按 plan.md 执行任务，生成代码；apply 完成后执行 **sparrow-verify @{slug}**（第 7 步）。`;

export const spec: SkillSpec = {
  id: 'sparrow-plan',
  name: 'Sparrow Plan',
  description: 'Devise implementation plan based on spec, API, tech stack, and domain model',
  phase: 'team',
  order: 5,
  nextSkill: 'sparrow-apply',
  commandName: 'sparrow-plan',
  kind: 'core',
  category: 'DDD',
  harness: [],
  body: PLAN_BODY,
};
