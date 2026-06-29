/**
 * Sparrow Model skill template.
 * Adapted from sparrow-ddd/.sparrow/rules/05-extract-domain-model.mdc
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

---

## 角色定义

你是一名 **DDD 领域建模专家**，负责为当前限界上下文生成完整的领域模型定义文档。

## 建模目标

1. **静态领域模型**：以聚合为基本单位的领域模型（聚合根、实体、值对象）
2. **动态领域模型**：通过任务分解和角色构造型，为每个业务服务绘制序列图

输出文件：**\`docs/sparrow/design/{slug}/model.md\`**

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

### 步骤一：任务分解
将每个业务服务分解为任务树：

**任务树结构**：
- **根**：业务服务作为根节点
- **枝**：组合任务作为枝节点
- **叶**：原子任务作为叶节点

**原子任务判断条件**：
1. 当前任务操作的领域知识属于一个聚合所完全拥有 → 原子任务
2. 当前任务需要访问外部资源（数据库、消息队列、外部系统等） → 原子任务
3. 用户界面交互 → 忽略

### 步骤二：角色构造型分配

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
[PlantUML 类图]

## 2. 动态领域模型

### 2.1 业务服务：{服务名称}

#### 任务树
\`\`\`
{根任务}
├── {组合任务1}
│   ├── {原子任务1.1}
│   └── {原子任务1.2}
└── {组合任务2}
    ├── {原子任务2.1}
    └── {原子任务2.2}
\`\`\`

#### 角色分配
\`\`\`
{根任务} → {Command}.{method}() + {AppService}.{method}()
├── {组合任务1} → {DomainService}.{method}()
│   ├── {原子任务1.1} → {Client}.{method}()
│   └── {原子任务1.2} → {Aggregate}.{method}()
...
\`\`\`

#### 序列图
[PlantUML 序列图]

## 3. 角色职责定义
[各角色及其职责的总结]
\`\`\`

## 质量检查清单

### 静态模型
- [ ] 所有核心概念都已识别为实体或值对象
- [ ] 聚合边界清晰，聚合根明确
- [ ] 实体间关系正确建模
- [ ] 值对象不可变且自包含
- [ ] 类图颜色规范正确（聚合根=浅红，实体=黄，值对象=蓝）
- [ ] PlantUML 类图语法正确

### 动态模型
- [ ] 任务树结构清晰，层次合理
- [ ] 原子任务判断准确
- [ ] 角色分配符合构造型定义
- [ ] 序列图完整，包含所有必要交互
- [ ] 序列图颜色规范正确
- [ ] PlantUML 序列图语法正确，使用 box 分组
- [ ] 角色协作约束得到严格遵守
- [ ] 序列图消息流与任务树执行流程完全对应

## 完成后的下一步

✅ 完成 sparrow-model @{slug} 后，请执行 **sparrow-plan @{slug}**（团队级）—— 基于 spec/api/tech/model 制订实现计划。
`;

export function register(): void {
  registerSkillTemplate('sparrow-model', () => MODEL_BODY);
}
