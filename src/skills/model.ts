/**
 * Sparrow Model skill template.
 *
 * This skill generates the domain model (static + dynamic) for a bounded context.
 */

import { registerSkillTemplate } from '../core/skill-generation.js';

const MODEL_BODY = `# Sparrow Model — 领域建模

## 执行顺序检查

\`\`\`
当前步骤：sparrow-model（第 4 步 / 共 6 步）
所属层级：团队级（team-level），针对特定限界上下文
前置条件：
  1. docs/sparrow/design/{slug}/spec.md 必须存在
  2. docs/sparrow/design/{slug}/api.md 必须存在
  3. docs/sparrow/design/{slug}/tech.md 必须存在
下一步骤：sparrow-plan @{slug}（团队级）
\`\`\`

**前置条件检查**：
- 如果 api.md 或 tech.md 不存在，请提示用户先执行 **sparrow-design @{slug}**
- 如果用户未指定限界上下文，请列出可用的限界上下文让用户选择
- 如果目标文件已存在，请参考下方"输出文件存在性检查"章节处理

---

## 🛑 输出文件存在性检查（必须在生成前执行）

在开始生成内容之前，请检查以下输出文件是否已经存在：

- \`docs/sparrow/design/{slug}/model.md\`

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
3. 更新 \`model.md\` 的状态从 \`_待生成_\` 改为 \`_v{version}_\`
4. 更新文件头部的"最后更新"时间戳

**project.md 路径**: \`docs/sparrow/project.md\`

---

## 📌 版本元数据管理

所有输出的文档文件**必须在文件开头**包含版本元数据块：

\`\`\`markdown
<!--
  version: v1.0
  last-updated: {ISO_8601_TIMESTAMP}
  generated-by: sparrow-model
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

## 角色定义

你是一名 **DDD 领域建模专家**，负责为当前限界上下文生成完整的领域模型定义文档。

## 建模目标

1. **静态领域模型**：以聚合为基本单位的领域模型（聚合根、实体、值对象）
2. **动态领域模型**：以 api.md 的 API 定义为入口，通过任务分解和角色构造型，为每个 API 绘制内部序列图

输出文件：**\`docs/sparrow/design/{slug}/model.md\`**

## 核心原则：API 驱动的动态建模

**动态领域模型以 design 阶段产出的 api.md 为起点，逐层向内部展开。**

- 从 \`docs/sparrow/design/{slug}/api.md\` 中提取当前 BC 的每个**对外公开的 API**
- 每个 API 作为动态领域模型**任务树的第一级入口**（根节点）
- 任务树从 API 入口出发，逐步分解到应用服务 → 领域服务 → 聚合 → 端口，直到原子任务
- **远程服务（Command/Query）的接口必须与 api.md 中的 API 定义保持一致**
- **应用服务的方法签名必须与远程服务的接口保持一致**
- 静态领域模型（类图）与动态领域模型（序列图）必须保持一致

> design 阶段定义的是"限界上下文之间"的协作契约；model 阶段建模的是"限界上下文内部"如何实现这些契约。

---

## 阶段一：静态建模阶段

### 步骤一：统一语言提炼
结合行业术语，明确统一语言，提炼所有业务服务中的核心概念及概念之间的关系。

### 步骤二：实体与值对象识别
- **实体 (Entity)**：具有唯一标识的对象，类图用**黄色** (#FFFFCC) 表示
- **值对象 (Value Object)**：不可变的对象，类图用**蓝色** (#E6F3FF) 表示

### 步骤三：关系建模
- **Composite 关系**：整体-部分，生命周期完全一致，使用 \`*-->\` 符号
- **Aggregation 关系**：整体-部分，生命周期可独立，使用 \`o-->\` 符号
- **关联关系**：普通关联
- **值对象关联**：使用 \`||--||\` (一对一) 或 \`||--o{\` (一对多)

### 步骤四：聚合识别
- 两个具有 Composite 关系的实体应该位于同一聚合中
- 具有 Aggregation 关系或普通关联关系的实体，位于不同的聚合
- 聚合根实体用**浅红色** (#FFE6E6) 表示，标注 \`<<AggregateRoot>>\`
- 聚合边界内的对象具有强一致性
- 聚合边界外的对象通过聚合根进行访问

### 步骤五：类图绘制（PlantUML）

使用 PlantUML 语法绘制 UML 类图：

\`\`\`plantuml
@startuml
!theme plain

' 聚合根 - 浅红色背景
class Meeting <<AggregateRoot>> #FFE6E6 {
    +MeetingId id
    +String title
    +MeetingStatus status
    --
    +createMeeting()
    +addParticipant()
    +startMeeting()
}

' 实体 - 黄色背景
class Participant #FFFFCC {
    +ParticipantId id
    +String email
    +ParticipantRole role
    --
    +joinMeeting()
}

' 值对象 - 蓝色背景
class MeetingTime #E6F3FF {
    +LocalDateTime startTime
    +LocalDateTime endTime
    +TimeZone timeZone
}

' 关系定义
Meeting o--> Participant : aggregates
Meeting ||--|| MeetingTime : has

@enduml
\`\`\`

**PlantUML 语法规范**：
- 使用 \`@startuml\` 和 \`@enduml\` 标记
- 关系符号：\`||--o{\` (一对多), \`||--||\` (一对一)
- Composite: \`*-->\` ，由整体指向部分
- Aggregate: \`o-->\` ，由整体指向部分
- 值对象关联：\`||--||\` 表示 has 关系

---

## 阶段二：动态建模阶段

### 步骤〇：API 入口提取（必须在任务分解之前执行）

1. 读取 \`docs/sparrow/design/{slug}/api.md\`，提取当前 BC 的**所有对外公开的 API**
2. 对每个 API，确认其通信协议（HTTP/RPC/Event）和操作签名
3. 这些 API 将作为动态领域模型**任务树的第一级入口**

**API 到任务树入口的映射规则**：

| API 类型 | 任务树入口 | 对应角色 |
|---------|-----------|---------|
| HTTP POST /api/v1/xxx | 命令任务（根任务） | Command |
| HTTP GET /api/v1/xxx | 查询任务（根任务） | Query |
| HTTP PUT/PATCH /api/v1/xxx | 命令任务（根任务） | Command |
| HTTP DELETE /api/v1/xxx | 命令任务（根任务） | Command |
| gRPC Method(param): result | 命令/查询任务 | Command/Query |
| 领域事件订阅 | 事件处理任务 | Command |

### 步骤一：任务分解
以每个 API 入口为根节点，将任务逐层分解为任务树：

**任务树结构**：
- **根**：API 入口（远程服务 Command/Query）
- **枝**：应用服务编排（AppService）
- **枝**：领域服务逻辑（DomainService）
- **叶**：聚合操作 / 端口调用（Repository/Client）→ 原子任务

**原子任务判断条件**：
1. 当前任务操作的领域知识属于一个聚合所完全拥有 → 原子任务
2. 当前任务需要访问外部资源（数据库、消息队列、外部系统等） → 原子任务
3. 用户界面交互 → 忽略

### 步骤二：角色构造型分配

**接口对齐约束（关键）**：
- **远程服务（Command/Query）的方法签名必须与 api.md 中对应 API 的定义完全一致**
  - 方法名 = api.md 中的 operationName
  - 参数类型 = api.md 中的 RequestType
  - 返回类型 = api.md 中的 ResponseType
- **应用服务（AppService）的方法签名必须与远程服务（Command/Query）的接口保持一致**
  - AppService 的方法名与 Command/Query 的方法名一致
  - 参数和返回类型保持一致

**角色构造型定义**：

| 角色 | 层 | 包位置 | 命名规范 | 颜色 |
|------|---|--------|---------|------|
| 命令 (Command) | api | api/command/ | *Command | 白色 |
| 查询 (Query) | api | api/query/ | *Query | 白色 |
| 消息 (DTO) | api | api/dto/ | *Request/*Response/*Event | 橙色 |
| 应用服务 | application | application/ | *AppService | 白色 |
| 领域服务 | domain | domain/service/ | *Service | 绿色 |
| 聚合根 | domain | domain/aggregate/ | 领域模型定义名 | 浅红色 |
| 端口 (接口) | infrastructure | infrastructure/port/ | *Repository/*Client | 白色 |

**角色构造型协作约束**：

1. **远程服务（命令/查询）只能访问应用服务和消息**
2. **应用服务只能访问领域服务、端口和消息**（不能直接访问聚合）
3. **领域服务可以访问领域服务、聚合和端口**
4. **聚合只能访问其他聚合**（不能访问领域服务、端口、远程服务或消息）
5. **端口可以访问聚合**
6. **消息只能被远程服务和应用服务访问**

### 步骤三：序列图绘制（PlantUML）

\`\`\`plantuml
@startuml
!theme plain

participant "CommandName" as CMD #FFFFFF
participant "AppServiceName" as APP #FFFFFF
participant "DomainService" as DS #CEF5CF
participant "AggregateRoot" as AR #FFE6E6
participant "Repository" as REPO #FFFFFF
participant "Client" as CL #FFFFFF

box "北向网关层（api + application）" #CCCCCC
participant CMD
participant APP
end box

box "领域层" #4CAF50
participant DS
participant AR
end box

box "南向网关层（infrastructure）" #CCCCCC
participant REPO
participant CL
end box

CMD -> APP: operation(Request)
activate APP

APP -> DS: domainMethod(params)
activate DS

DS -> AR: aggregateMethod(data)
activate AR
AR --> DS: result
deactivate AR

DS -> REPO: save(aggregate)
activate REPO
REPO --> DS: saved
deactivate REPO

APP --> CMD: Response
deactivate APP

@enduml
\`\`\`

---

## 输出文档格式

写入 **\`docs/sparrow/design/{slug}/model.md\`**：

\`\`\`markdown
# {限界上下文中文名} - 领域模型定义

## 1. 静态领域模型

### 1.1 聚合定义
#### 聚合1：{聚合名称}
- **聚合根**：{AggregateRootName}
- **实体**：{Entity1}, {Entity2}
- **值对象**：{VO1}, {VO2}

### 1.2 领域模型类图
[PlantUML 类图 — UML 命名风格]

## 2. 动态领域模型

> 以下每个 API 入口来自 docs/sparrow/design/{slug}/api.md

### 2.1 API：{API名称}（来自 api.md）

**API 定义**：\`POST /api/v1/resource\`

#### 任务树
\`\`\`
{CommandName}.{method}(Request): Response         ← API 入口（与 api.md 一致）
├── {AppService}.{method}(Request): Response      ← 应用服务（签名与 Command 一致）
│   ├── {DomainService}.{method}(params): result  ← 领域服务
│   │   ├── {Aggregate}.{method}(data): result    ← 聚合操作（原子任务）
│   │   └── {Repository}.{save}(aggregate)        ← 端口调用（原子任务）
│   └── {Client}.{call}(params): result           ← 外部调用（原子任务）
\`\`\`

#### 角色分配
\`\`\`
{根任务} → {Command}.{method}(Request): Response
├── {组合任务} → {AppService}.{method}(Request): Response
│   ├── {原子任务1} → {DomainService}.{method}(params): result
│   │   ├── {Aggregate}.{method}(data): result
│   │   └── {Repository}.{save}(aggregate)
│   └── {原子任务2} → {Client}.{call}(params): result
...
\`\`\`

#### 序列图
[PlantUML 序列图 — 展示 BC 内部各角色的协作]

### 2.2 API：{下一个API名称}
...

## 3. 角色职责定义
[各角色及其职责的总结]
\`\`\`

**命名约定（UML 风格）**：
- 类名：PascalCase（如 \`OrderCommand\`、\`OrderAppService\`）
- 方法名：camelCase（如 \`placeOrder()\`、\`getOrderById()\`）
- 属性名：camelCase（如 \`orderId\`、\`customerName\`）
- 命名空间/包：dot.case（如 \`com.sparrow.order\`）

> 代码实现时，命名将根据具体开发语言的习惯进行转换（参见 sparrow-apply 中的命名规范）。

## 质量检查清单

### 静态模型
- [ ] 所有核心概念都已识别为实体或值对象
- [ ] 聚合边界清晰，聚合根明确
- [ ] 实体间关系正确建模
- [ ] 值对象不可变且自包含
- [ ] 类图颜色规范正确（聚合根=浅红，实体=黄，值对象=蓝）
- [ ] PlantUML 类图语法正确

### 动态模型
- [ ] **每个 api.md 中的 API 都有对应的任务树入口**（不遗漏）
- [ ] **远程服务（Command/Query）的接口签名与 api.md 的 API 定义一致**
- [ ] **应用服务的方法签名与远程服务接口一致**
- [ ] 任务树结构清晰，层次合理（API → AppService → DomainService → Aggregate/Port）
- [ ] 原子任务判断准确
- [ ] 角色分配符合构造型定义
- [ ] 序列图完整，展示 BC 内部所有必要交互
- [ ] 序列图颜色规范正确
- [ ] PlantUML 序列图语法正确，使用 box 分组
- [ ] 角色协作约束得到严格遵守
- [ ] 序列图消息流与任务树执行流程完全对应

### 模型一致性
- [ ] 静态模型中的聚合、实体、值对象在动态模型的序列图中正确使用
- [ ] 类图中的方法与序列图中的消息调用一致
- [ ] UML 命名风格统一（PascalCase 类名，camelCase 方法/属性）

## 完成后的下一步

✅ 完成 sparrow-model @{slug} 后，请执行 **sparrow-plan @{slug}**（团队级）—— 基于 spec/api/tech/model 制订实现计划。
`;

export function register(): void {
  registerSkillTemplate('sparrow-model', () => MODEL_BODY);
}
