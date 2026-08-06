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

{{HARNESS}}

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

## 变更模式（revise）— 按 BC 档位按需重生成

> **⚠️ 门控声明（向后兼容硬性约束）**：本节仅在**检测到活动变更**时进入。**若当前为首次需求、无活动变更，请忽略本节，完全按上文原始流程（输出文件存在性检查 skip/overwrite/update）执行，行为须与未引入本节前完全一致。**

**触发条件**（同 sparrow-arch「变更处理 / revise」章节）：\`docs/sparrow/changes/\` 含未归档变更文件夹，或 \`project.md\` 当前 change-id 非空。

**revise 行为**：
1. 从 \`project.md\`「变更管理」块读取本次变更的**受影响 slug 列表**。
2. 对每个受影响 slug，依据其档位（S0–S4，见 sparrow-arch）判断是否在本阶段处理：
   - **model 阶段处理条件**：档位 ≥ S2（即 design 已完成且已建模）
   - 不满足则跳过该 slug
3. 满足条件的 slug：在现有 \`model.md\` 基础上，按 \`changes/{change-id}/deltas/design/{slug}/model.md\`（若有）做增量更新或重生成（沿用存在性检查的 update 语义），版本号递增并追加 \`change-id\` 到元数据块。
4. 未受影响的 slug 不处理。

> 仅 S0/S1 档位的 BC 不会到达 model，本阶段不参与。

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

> **revise 模式扩展（仅活动变更时）**：当处于 revise 模式（判定见 sparrow-arch「变更处理 / revise」章节）更新已有文档时，在元数据块**追加可选字段** \`change-id: {change-id}\`（必要时加 \`supersedes: {被取代版本}\`）。基线（无活动变更）**不追加**这些字段，输出与未引入前一致。

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

### 领域建模设计原则（面向对象）

> 📐 面向对象设计原则的完整纪律见约束资产 \`model/domain-modeling.md\`。进行静态领域建模时，**必须遵循**信息专家模式、迪米特法则、避免贫血模型、封装原则，确保领域模型富含行为而非贫血：
>
> - **信息专家**：将操作分配给拥有该操作所需数据的对象
> - **迪米特法则**：对象只与直接朋友通信，聚合间通过聚合根 ID 引用，避免链式调用
> - **避免贫血模型**：禁止为每个属性定义 \`getXxx()\` / \`setXxx()\`，只定义代表真实业务含义的操作
> - **封装原则**：状态变更必须通过业务操作，值对象不可变，属性暴露以最小必要为原则

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

### 步骤五：聚合根实体操作定义
针对每个聚合根，结合业务语义，初步定义其可能承担的操作方法。

**合法的业务操作类型**（体现信息专家模式，避免贫血模型）：

- **构造/工厂操作**：创建聚合实例的静态工厂方法（如 \`placeOrder()\`、\`scheduleMeeting()\`）
- **状态变更操作**：体现业务意图的状态转换（如 \`start()\`、\`cancel()\`、\`approve()\`、\`reject()\`）
- **实体管理操作**：管理聚合内子实体（如 \`addParticipant()\`、\`removeLineItem()\`）
- **计算/查询操作**：基于聚合内部状态的计算（如 \`calculateTotal()\`、\`isOverdue()\`）
- **业务规则校验**：聚合级别的业务规则检查（如 \`canBeModified()\`、\`isValidForSubmission()\`）

**反模式 — 以下操作禁止定义**：

- ❌ 裸露的 getter/setter：\`getName()\`、\`setName()\`、\`getStatus()\`、\`setStatus()\` → 破坏封装，导致贫血模型
- ❌ 纯数据存取方法：为每个属性生成成对的 get/set → 等同于把聚合当数据容器
- ❌ 跨聚合访问方法：\`getOtherAggregate()\` → 违反迪米特法则
- ❌ 无业务含义的 CRUD：\`update()\`、\`save()\`、\`delete()\` → 动态建模阶段由领域服务和端口承担

> ⚠️ **重要**：即使某个属性需要在外部被读取（如列表展示），也不要在此阶段定义 getter。只有在经过阶段二动态建模、确认该属性确实需要被外部使用时，才在终版类图中以最小可见性暴露。阶段一仅定义**业务行为操作**。

> 注意：阶段一的操作定义为**初步定义**，最终的操作分配将在阶段三中根据动态建模结果进行调整和确认。

### 步骤六：类图绘制（PlantUML）

使用 PlantUML 语法绘制 UML 类图：

\`\`\`plantuml
@startuml
!theme plain

' 聚合根 - 浅红色背景（属性用 - 表示私有，操作用 + 表示公开）
class Meeting <<AggregateRoot>> #FFE6E6 {
    - MeetingId id
    - String title
    - MeetingStatus status
    --
    + scheduleMeeting()
    + addParticipant(Participant)
    + startMeeting()
    + calculateDuration()
    + isInProgress()
}

' 实体 - 黄色背景
class Participant #FFFFCC {
    - ParticipantId id
    - String email
    - ParticipantRole role
    --
    + assignRole(ParticipantRole)
    + changeEmail(String)
}

' 值对象 - 蓝色背景（全量构造，无操作区）
class MeetingTime #E6F3FF {
    + LocalDateTime startTime {readonly}
    + LocalDateTime endTime {readonly}
    + TimeZone timeZone {readonly}
    --
    + overlap(MeetingTime): boolean
    + duration(): Duration
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
- **属性可见性**：领域对象的属性统一使用 \`-\`（私有），操作使用 \`+\`（公开），以体现封装原则
- **值对象属性**：标记 \`{readonly}\` 表示不可变

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
| 适配器 (实现) | infrastructure | infrastructure/adapter/ | *RepositoryImpl/*ClientImpl | 白色 |

> **持久化对象（PO）纪律**：若 ORM 引入了持久化对象（PO），则 PO 属于南向网关的消息契约，必须负责 **PO ↔ 聚合的双向转换**。**端口的接口定义禁止出现领域层之外的对象类型**（如 DTO、PO、框架特定类型），只能使用领域层类型和基本类型。完整纪律见约束资产 \`model/architecture.md\`。

**角色构造型协作约束**：

> 📐 完整的允许 / 禁止调用规则见约束资产 \`model/architecture.md\`，其中关键纪律包括：
> 1. 远程服务（命令/查询）只能访问应用服务和消息
> 2. 应用服务只能访问领域服务、端口和消息（**不能直接访问聚合**）
> 3. 领域服务可以访问领域服务、聚合和端口
> 4. 聚合只能访问其他聚合（不能访问领域服务、端口、远程服务或消息）
> 5. 端口可以访问聚合
> 6. 消息只能被远程服务和应用服务访问

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

## 阶段三：动静结合阶段

在完成阶段二的动态建模后，**回过来更新和确认阶段一生成的静态领域模型**。

### 步骤一：提取序列图中的职责分配

对阶段二中绘制的每张序列图，分析消息流中分配到各角色的职责：

1. 从序列图中提取每个角色接收到的**操作调用**
2. 识别操作调用的目标对象类型（聚合根、实体、领域服务、应用服务等）
3. 整理形成"角色 → 操作"的映射表

**提取规则**：

| 序列图中的消息 | 所分配给的静态模型对象 | 说明 |
|--------------|-------------------|------|
| \`AR -> AR: aggregateOperation(data)\` | 聚合根 / 实体 | 聚合内部的操作 |
| \`DS -> AR: aggregateOperation(data)\` | 聚合根 | 领域服务调用的聚合根操作 |
| \`APP -> DS: domainOperation(params)\` | 领域服务 | 应用服务调用的领域服务操作 |

### 步骤二：将职责操作映射到静态模型

根据步骤一提取的映射表，将操作分配到静态领域模型中的对应对象：

1. **聚合根操作确认**：将序列图中所有发送到聚合根的操作，与阶段一中初步定义的聚合根操作进行对比：
   - 阶段一已定义的操作，但序列图中未出现 → **以序列图为准，从类图中移除此操作**
   - 阶段一未定义的操作，但序列图中出现 → **以序列图为准，补充到聚合根类图**
   - 阶段一与序列图一致的操作 → 保留并确认
2. **实体操作确认**：将序列图中发送到聚合内实体（非聚合根）的操作，分配给对应实体
3. **领域服务操作确认**：将序列图中发送到领域服务的操作，确认为领域服务的操作
4. **应用服务操作确认**：将序列图中发送到应用服务的操作，确认为应用服务的操作

> ⚠️ **优先级原则**：当阶段一与阶段三存在差异时，**始终以阶段三从序列图提取到的操作为准**。序列图来自对 API 行为（api.md）的任务分解和角色协作分析，更精确地反映了系统实际需要的操作。阶段一的初步定义是静态视角下的推测，阶段三的动态分析能更准确地揭示该聚合根在业务流程中真正承担的职责。

### 步骤三：更新静态类图

根据步骤二的操作分配结果，更新阶段一的 PlantUML 类图：

- 在聚合根的类图中补充或移除操作（以阶段三提取结果为准）
- 在实体的类图中补充操作
- 确保类图中的操作与序列图中的消息调用**完全一致**

### 步骤四：一致性验证

验证静动模型的一致性：

- [ ] 序列图中每个发往聚合根/实体的消息，对应类图中存在同名操作
- [ ] 类图中聚合根/实体的每个操作，在至少一张序列图中有对应的消息调用
- [ ] 序列图中角色数量与类图中类数量匹配
- [ ] 序列图中消息的调用关系与类图中关联关系一致

> 阶段三的核心目标是**消除静动模型之间的不一致**，确保类图（静态结构）与序列图（动态行为）完全对应。当不一致时，以阶段三为准。

---

## 输出文档格式

写入 **\`docs/sparrow/design/{slug}/model.md\`**：


\`\`\`markdown
# {限界上下文中文名} - 领域模型定义

## 1. 静态领域模型（阶段一输出）

### 1.1 聚合定义
#### 聚合1：{聚合名称}
- **聚合根**：{AggregateRootName}
- **实体**：{Entity1}, {Entity2}
- **值对象**：{VO1}, {VO2}

### 1.2 领域模型类图（初版）
[PlantUML 类图 — UML 命名风格，聚合根包含阶段一初步定义的操作]

## 2. 动态领域模型（阶段二输出）

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

## 3. 动静结合确认（阶段三输出）

### 3.1 职责映射表
[从序列图提取的"角色 → 操作"映射]

### 3.2 领域模型类图（终版）
[经过阶段三确认和调整后的最终 PlantUML 类图，操作与序列图消息完全一致]

## 4. 角色职责定义
[各角色及其最终职责的总结]
\`\`\`

**命名约定（UML 风格）**：
- 类名：PascalCase（如 \`OrderCommand\`、\`OrderAppService\`）
- 方法名：camelCase（如 \`placeOrder()\`、\`getOrderById()\`）
- 属性名：camelCase（如 \`orderId\`、\`customerName\`）
- 命名空间/包：dot.case（如 \`com.sparrow.order\`）

> 代码实现时，命名将根据具体开发语言的习惯进行转换（参见 sparrow-apply 中的命名规范）。

## 质量检查清单

### 静态模型（阶段一 + 阶段三）
- [ ] 所有核心概念都已识别为实体或值对象
- [ ] 聚合边界清晰，聚合根明确
- [ ] 实体间关系正确建模
- [ ] 值对象不可变且自包含
- [ ] 类图颜色规范正确（聚合根=浅红，实体=黄，值对象=蓝）
- [ ] PlantUML 类图语法正确
- [ ] 聚合根实体已初步定义操作方法（构造、状态变更、实体管理、查询）
- [ ] **聚合根/实体的操作遵循信息专家模式**（操作分配给拥有该操作所需数据的对象）
- [ ] **无裸露的 getter/setter 操作**（没有为每个属性定义 getXxx() / setXxx()）
- [ ] **类图属性可见性**：属性使用 \`-\` 私有，而非 \`+\` 公开
- [ ] **聚合之间仅通过 ID 引用**，不跨聚合直接持有对象引用（迪米特法则）
- [ ] **值对象不可变**，所有字段在构造时初始化，无修改方法

### 动态模型（阶段二）
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

### 模型一致性（阶段三）
- [ ] 从序列图中提取了完整的职责映射表
- [ ] 聚合根操作与序列图消息对照确认（以序列图为准，保留/补充/移除）
- [ ] 静态模型中的聚合、实体、值对象在动态模型的序列图中正确使用
- [ ] 类图中的操作与序列图中的消息调用完全一致
- [ ] 序列图中每个发往聚合根/实体的消息，在终版类图中有同名操作
- [ ] 终版类图中聚合根/实体的每个操作，在至少一张序列图中有对应调用
- [ ] UML 命名风格统一（PascalCase 类名，camelCase 操作/属性）

## 完成后的下一步

✅ 完成 sparrow-model @{slug} 后，请执行 **sparrow-plan @{slug}**（团队级）—— 基于 spec/api/tech/model 制订实现计划。`;

export function register(): void {
  registerSkillTemplate('sparrow-model', () => MODEL_BODY);
}
