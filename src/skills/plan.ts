/**
 * Sparrow Plan skill template.
 *
 * This skill creates an implementation plan based on spec, api, tech, and model documents.
 */

import { registerSkillTemplate } from '../core/skill-generation.js';

const PLAN_BODY = `# Sparrow Plan — 实现计划制订

## 执行顺序检查

\`\`\`
当前步骤：sparrow-plan（第 5 步 / 共 6 步）
所属层级：团队级（team-level），针对特定限界上下文
前置条件（必须全部存在）：
  1. docs/sparrow/design/{slug}/spec.md
  2. docs/sparrow/design/{slug}/api.md
  3. docs/sparrow/design/{slug}/tech.md
  4. docs/sparrow/design/{slug}/model.md
下一步骤：sparrow-apply @{slug}（团队级）
\`\`\`

**前置条件检查**：
- 如果上述任一前置文件不存在，请提示用户缺少哪个文件，以及需要先执行什么步骤
- 如果用户未指定限界上下文，请列出可用的限界上下文让用户选择
- 如果目标文件已存在，请参考下方"输出文件存在性检查"章节处理

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
| 3 | **基础设施层** | infrastructure/port/ + adapter/ |
| 4 | **应用层** | application/（AppService） |
| 5 | **api 层** | api/dto、api/command、api/query |

---

## 代码模块布局

### 核心原则

- **一个限界上下文 = 一个产品模块**，根目录为 **\`backend/\`**
- 四层（api、application、domain、infrastructure）以包/目录划分
- **集成/API 测试**在 **\`integration-tests/{slug}/\`** 下
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

## 任务完整性检查表

从下列角度自检，避免遗漏：

| 角度 | 应覆盖的典型步骤 |
|------|-----------------|
| spec | 与关键场景对应的实现与验证 |
| api | 契约测试、控制器形状与错误码 |
| model | 聚合/实体/值对象/领域服务与序列图约束 |
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

## 完成后的下一步

✅ 完成 sparrow-plan @{slug} 后，请执行 **sparrow-apply @{slug}**（团队级）—— 按 plan.md 执行任务，生成 DDD 四层代码。
`;

export function register(): void {
  registerSkillTemplate('sparrow-plan', () => PLAN_BODY);
}
