/**
 * Sparrow Design skill template.
 *
 * This skill generates API contracts (api.md) and technology stack selection (tech.md)
 * for a specific bounded context.
 */

import type { SkillSpec } from '../core/skills.js';

const DESIGN_BODY = `# Sparrow Design — API 契约与技术选型

## 执行顺序检查

在执行之前，请检查当前阶段是否合适：

\`\`\`
当前步骤：sparrow-design（第 3 步 / 共 8 步）
所属层级：团队级（team-level），针对特定限界上下文或交互上下文
前置条件：
  1. docs/sparrow/architecture/application.md 必须存在（后端 BC）
     或 docs/sparrow/architecture/frontend.md 必须存在（交互上下文）
  2. docs/sparrow/design/{slug}/spec.md 必须存在
下一步骤：sparrow-model @{slug}（团队级）
\`\`\`

**前置条件检查**：
- 如果 \`docs/sparrow/architecture/application.md\` 不存在且 \`docs/sparrow/architecture/frontend.md\` 不存在，请提示用户先执行 **sparrow-arch**
- 如果 \`docs/sparrow/design/{slug}/spec.md\` 不存在，请提示用户先执行 **sparrow-arch**
- 如果用户未指定 slug，请列出可用的 slug 让用户选择（从 project.md 中读取所有 BC 和交互上下文）

### Slug 类型判定

在执行 design 之前，先判定当前 slug 是**后端限界上下文**还是**交互上下文**：

1. 读取 \`docs/sparrow/project.md\` 的「限界上下文设计」部分
2. 查找当前 slug 对应的子章节
3. 如果标注了 **— *交互上下文*** 标记 → 当前 slug 是交互上下文，执行下方「交互上下文设计」分支
4. 否则 → 当前 slug 是后端 BC，执行下方「后端限界上下文设计」分支（保持现有逻辑）

---

## 🛑 输出文件存在性检查（必须在生成前执行）

在开始生成内容之前，请检查以下输出文件是否已经存在：

- \`docs/sparrow/design/{slug}/api.md\`
- \`docs/sparrow/design/{slug}/tech.md\`

如果任一文件已存在，请**让用户进行一次选择**（该选择将应用于所有已存在的文件）：

- **跳过 (skip)**：保留已有文件，不执行任何生成操作，停止执行
- **覆盖 (overwrite)**：删除已有文件，重新生成全新的内容
- **更新 (update)**：在已有文件基础上进行修改和完善

> ⚠️ 一次命令只确认一次，用户的选择应用于所有输出文件。

---

## 变更模式（revise）— 按 BC 档位按需重生成

> **⚠️ 门控声明（向后兼容硬性约束）**：本节仅在**检测到活动变更**时进入。**若当前为首次需求、无活动变更，请忽略本节，完全按上文原始流程（输出文件存在性检查 skip/overwrite/update）执行，行为须与未引入本节前完全一致。**

**触发条件**（同 sparrow-arch「变更处理 / revise」章节）：\`docs/sparrow/changes/\` 含未归档变更文件夹，或 \`project.md\` 当前 change-id 非空。

**revise 行为**：
1. 从 \`project.md\`「变更管理」块（或 \`changes/{change-id}/proposal.md\`）读取本次变更的**受影响 slug 列表**及 arch 记录的重构动作。
2. 对每个受影响 slug，依据其档位（S0–S4，见 sparrow-arch）判断是否在本阶段处理：
   - **design 阶段处理条件**：slug 为新建（无 api.md/tech.md 产物）**或** 档位 ≥ S1
   - 不满足则跳过该 slug
3. 满足条件的 slug：在现有 \`api.md\`/\`tech.md\` 基础上，按 \`changes/{change-id}/deltas/design/{slug}/\` 做增量更新或重生成（沿用存在性检查的 update 语义），版本号递增并追加 \`change-id\` 到元数据块；同步更新项目级 \`api.md\`。
4. 未受影响的 slug 不处理。

> 仅 S0 档位的 BC 不会到达 design，由 arch 直接记录原因，本阶段不参与。完整 BC→代码映射见 sparrow-apply 与 \`docs/prd/sparrow-change-management.md\`。

---

## 📋 project.md 更新

完成输出后，**必须**更新 \`docs/sparrow/project.md\`：

1. 如果 \`project.md\` 不存在，根据当前项目信息创建它
2. 在"限界上下文设计"部分，找到当前 \`{slug}\` 的子章节
3. 更新 \`api.md\` 和 \`tech.md\` 的状态从 \`_待生成_\` 改为 \`_v{version}_\`
4. 确保 project.md 的"API 目录"部分引用了 \`docs/sparrow/api.md\`：
   \`\`\`markdown
   ### 5. API 目录
   - [API 总目录](./api.md) — 所有限界上下文的公开 API 汇总
   \`\`\`
5. 更新文件头部的"最后更新"时间戳

**project.md 路径**: \`docs/sparrow/project.md\`

---

## 📌 版本元数据管理

所有输出的文档文件**必须在文件开头**包含版本元数据块：

\`\`\`markdown
<!--
  version: v1.0
  last-updated: {ISO_8601_TIMESTAMP}
  generated-by: sparrow-design
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

## 后端限界上下文设计

> 以下内容适用于**后端限界上下文**。若当前 slug 为交互上下文，请跳至下方「交互上下文设计」章节。

## 角色定义

你是一名**应用系统架构师与技术负责人**，负责为当前限界上下文生成：
1. **服务契约文档（api.md）**：包含跨上下文协作序列图、API 定义和组件图
2. **技术选型文档（tech.md）**：技术栈选择与实现约束

## 核心原则：聚焦跨上下文协作

**本阶段的关注点是限界上下文之间的关系，而非上下文内部的实现细节。**

- ✅ 序列图仅体现**限界上下文之间**以及**限界上下文与外部系统（第三方）之间**的协作
- ✅ API 定义是当前限界上下文**对外公开**的服务契约
- ✅ 跨上下文的消息交互（同步调用 + 异步事件）
- ❌ **不要**涉及限界上下文内部的实现（如领域服务、聚合、数据库操作等）
- ❌ **不要**设计内部架构的分层细节

> 限界上下文内部的领域建模由后续的 **sparrow-model** 阶段完成。API 定义将作为 model 阶段动态领域模型任务树的第一级入口。

## 核心原则：一个业务服务 = 一个 API

**在 sequence diagram 中，actor 向当前限界上下文应只发起一次请求。**

这是连接 explore 与 design 的关键约束：
- explore 阶段识别的每个**业务服务**，对应 design 阶段 actor 向当前 BC 发起的**一次请求**
- 这一请求驱动出一个**序列图**，进而推导出一个 **API 定义**
- 因此：**一个业务服务 → 一个序列图 → 一个 API**

### 序列图绘制约束

1. 每个序列图中，actor（参与者 / 其他 BC / 外部系统）向当前限界上下文**只发起一次请求**
2. 当前 BC 收到请求后，可以选择性地调用其他 BC 或外部系统
3. 不要在一个序列图中绘制多个独立的业务服务
4. 如果当前 BC 对外提供了 N 个业务服务（来自 spec.md），则应绘制 N 个独立的序列图，定义 N 个 API

### 自检清单

- [ ] 当前 BC 的 API 数量是否等于 spec.md 中分配给当前 BC 的业务服务数量？
- [ ] 每个序列图中，向当前 BC 发起的请求是否只有**一次**？
- [ ] 如发现 API 数量与业务服务数量不一致，请重新检查序列图是否合并了多个独立的业务服务。

## 输入文档要求

### 必需文档
1. **业务服务列表文档**：\`docs/sparrow/design/{slug}/spec.md\`（当前限界上下文的切片需求）
2. **应用架构定义文档**：\`docs/sparrow/architecture/application.md\`
3. **架构图中的技术实现建议**（来自 application.md 中对当前上下文的描述）

## 技术选型交互流程

在执行 sparrow-design 时，你需要引导用户进行以下选择：

### 第一步：选择后端实现语言
请用户从以下选项中选择：
1. **Java** (Spring Boot 3.x + Maven)
2. **Node.js** (TypeScript + Express/NestJS)
3. **Python** (FastAPI/Django + uv)
4. **Go** (标准库 net/http 或 chi)
5. **Rust** (Axum + SQLx)
6. **C++** (C++17/20 + CMake + drogon/pistache)

### 第二步：选择具体技术栈方案
根据用户选择的语言，提供该语言下的若干套备选技术栈（包含框架、数据库、消息队列、缓存等），让用户选择。

### 第三步：写入 tech.md
将用户选定的方案写入 \`docs/sparrow/design/{slug}/tech.md\`

## tech.md 结构

写入 **\`docs/sparrow/design/{slug}/tech.md\`**：

\`\`\`markdown
# 技术选型 — {限界上下文中文名} ({english-slug})

## 1. 概述与选型结论
- **选定方案**: {方案标题}
- **结论摘要**: {为什么该方案适配本上下文}

## 2. 与应用架构的对应关系
- **技术实现建议（摘录）**: {来自 application.md}
- **对策**: {选型如何落实上述建议}

## 3. 选定技术栈详述
| 层次 | 选型 | 说明 |
|------|------|------|
| 运行时 / 语言 | | |
| 应用框架 | | |
| API 层 | | |
| 主要依赖 | | |

## 4. API 与集成
- **对外契约**: 对齐 api.md
- **认证与授权**:
- **第三方与上游上下文**:

## 5. 数据与持久化
- **存储**:
- **事务与一致性**:
- **缓存（若适用）**:

## 6. 横切能力
- **可观测性**:
- **配置**:
- **安全**:

## 7. 构建、测试与部署
- **构建**:
- **测试**:
- **部署/运行**:
- **模块边界**: code/{slug}/ 单模块，DDD 四层为包/目录划分

## 8. 风险与待决事项
\`\`\`

---

## 服务契约生成步骤

### 步骤1: 分析业务服务分配
1. 从当前限界上下文的 spec.md 中提取业务服务列表
2. 确定服务契约的调用方式 (HTTP/RPC/Event)
3. 区分哪些是当前 BC 对外提供的服务，哪些依赖其他 BC

### 步骤2: 分析上下文映射关系
1. 从 application.md 中识别当前上下文与其他上下文的关系
2. 确定调用模式 (Customer/Supplier, ACL, OHS 等)
3. 设计跨上下文的消息交互（同步调用 + 异步事件）

### 步骤3: 绘制序列图（仅限界上下文级别）
1. 确定参与者：仅包含限界上下文和外部系统，**不包含 BC 内部的组件**
2. 设计跨 BC 的消息交互流程
3. 标注消息的通信协议（HTTP REST / gRPC / 消息队列等）
4. 添加业务逻辑注释
5. 处理异常流程

### 步骤4: 定义 API
1. 根据序列图中的消息交互，提取当前 BC 对外公开的 API
2. 确定通信协议（HTTP 方法 + 资源路径，或 RPC 方法签名，或事件定义）
3. 设计请求/响应模型（DTO 格式）
4. 定义错误处理

## 序列图绘制规则

### 参与者定义
- **只包含限界上下文作为整体参与者**，每个 BC 是一个 participant
- **外部系统**（第三方支付、短信网关等）作为独立参与者
- **绝不包含** BC 内部组件（如 Command、AppService、聚合、Repository 等）
- 序列图的粒度是"限界上下文对限界上下文"，不是"类对类"

### 消息交互类型
1. **HTTP RESTful 调用**: 使用 \`->>\` 表示同步请求，\`-->>\` 表示同步响应
2. **RPC 调用 (gRPC等)**: 使用 \`->>\` 表示同步调用
3. **事件发布**: 使用 \`->>\` 发往消息队列，标注事件名称
4. **事件订阅**: 使用 \`-->>\` 从消息队列接收，标注事件名称

### 序列图模板
\`\`\`mermaid
sequenceDiagram
    participant 外部系统 as External System
    participant 上游上下文 as Upstream Context
    participant 下游上下文 as Downstream Context

    外部系统->>上游上下文: 发起请求
    上游上下文->>下游上下文: 调用服务
    Note right of 下游上下文: 业务处理逻辑
    下游上下文-->>上游上下文: 返回结果
    上游上下文-->>外部系统: 响应结果
\`\`\`

## API 定义规则

### RESTful 设计原则
- 使用 HTTP 动词表示操作类型
- 使用名词表示资源
- 使用复数形式命名资源
- 使用嵌套 URL 表示资源关系

### API 模板
\`\`\`yaml
- API名称: 服务名称
- API定义: operationName(RequestType): ResponseType
- Swagger协议: HTTP_METHOD /api/v1/resource

#### Request Format
{ "field1": "type", "field2": "type" }

#### Response Format
{ "status": "success|error", "data": {}, "message": "Optional message" }
\`\`\`

## api.md 结构

写入 **\`docs/sparrow/design/{slug}/api.md\`**：

\`\`\`markdown
# 服务契约 — {限界上下文中文名}

## 1. 限界上下文概述
## 2. 服务契约列表
## 3. 服务契约详细定义

### 3.1 {服务名称}
#### 序列图
[Mermaid 序列图 — 仅限界上下文级别]

#### API 定义
- **API名称**:
- **API定义**: operationName(RequestType): ResponseType
- **通信协议**: HTTP_METHOD /api/v1/resource（或 gRPC 方法签名 / 事件定义）

#### Request Format
{ "field1": "type", "field2": "type" }

#### Response Format
{ "status": "success|error", "data": {}, "message": "Optional message" }

---

## 4. 组件图（PlantUML）

使用 PlantUML 绘制当前限界上下文及其协作上下文的**组件图**。组件图放置在所有服务契约定义之后、版本元数据之前。

### 组件图绘制规则

**组件表示**：
- 当前限界上下文用 \`[当前上下文名称]\` 表示
- 协作的其他限界上下文用 \`[协作上下文名称]\` 表示
- 外部系统用 \`[外部系统名称]\` 表示

**接口表示**：
- **provided interface**（当前 BC 对外公开的 API）：使用 \`()\` 圆圈接口符号
- **required interface**（当前 BC 调用其他 BC 的 API）：使用 \`()\` 半圆接口符号

**事件表示**：
- 事件发布：使用 \`-->>\` 箭头，标注事件名称
- 事件订阅：使用 \`<<--\` 箭头，标注事件名称

### 组件图模板

\`\`\`plantuml
@startuml
!theme plain

' 当前限界上下文
component "{当前BC中文名}" as CurrentBC

' 协作的限界上下文
component "{协作BC1中文名}" as BC1
component "{协作BC2中文名}" as BC2

' 外部系统
component "{外部系统名}" as ExtSys

' 当前 BC 对外提供的 API (provided interface)
() "POST /api/v1/orders" as API_PlaceOrder
() "GET /api/v1/orders/{id}" as API_GetOrder

' 当前 BC 依赖的 API (required interface)
() "GET /api/v1/users/{id}" as API_GetUser
() "POST /api/v1/payments" as API_CreatePayment
() "OrderPlaced" as EVT_OrderPlaced

' provided interfaces 连接到当前 BC
CurrentBC -- API_PlaceOrder
CurrentBC -- API_GetOrder

' required interfaces 连接到协作 BC
API_GetUser -- BC1
API_CreatePayment -- BC2

' 事件发布/订阅
CurrentBC -->> EVT_OrderPlaced : publishes
ExtSys <<-- EVT_OrderPlaced : subscribes

@enduml
\`\`\`

> **提示**：以上模板中的 API 和事件应与"服务契约详细定义"章节中的定义一一对应。
\`\`\`

---

## 项目级 API 目录更新

完成当前限界上下文的 api.md 后，**必须**更新 \`docs/sparrow/api.md\`（项目级 API 总目录）。

### api.md 目录结构（项目级）

\`\`\`markdown
# API 目录 — {项目名称}

> 本文件由 Sparrow 自动维护，汇总所有限界上下文的公开 API。
> 每完成一个限界上下文的 sparrow-design 操作后更新。

## {限界上下文1中文名} (\`{slug1}\`)

### 对外提供的 API (Provided)

| API 名称 | 通信协议 | 定义 | 说明 |
|---------|---------|------|------|
| 提交订单 | HTTP POST | /api/v1/orders | 创建新订单 |
| 查询订单 | HTTP GET | /api/v1/orders/{id} | 按ID查询订单 |

### 对外发布的事件

| 事件名称 | 事件类型 | 说明 |
|---------|---------|------|
| OrderPlaced | 领域事件 | 订单已提交 |

### 依赖的 API (Required)

| API 名称 | 提供方上下文 | 通信协议 | 说明 |
|---------|------------|---------|------|
| 查询用户 | user-identity | HTTP GET | 获取用户信息 |

---

## {限界上下文2中文名} (\`{slug2}\`)

...
\`\`\`

### 更新操作

1. 如果 \`docs/sparrow/api.md\` 不存在，根据上述模板创建
2. 在文件中找到当前限界上下文的章节（如不存在则新增）
3. 更新"对外提供的 API"表格（与 api.md 中的 API 定义保持一致）
4. 更新"对外发布的事件"表格
5. 更新"依赖的 API"表格（列出当前 BC 调用的其他 BC 的 API）
6. 更新文件头部的"最后更新"时间戳

## 质量检查清单

- [ ] 序列图只包含限界上下文级别和外部系统的交互（无内部组件）
- [ ] **每个序列图中 actor 向当前 BC 只发起了一次请求**
- [ ] **API 数量 = 分配给当前 BC 的业务服务数量**（来自 spec.md）
- [ ] 序列图中每个跨 BC 消息都明确了通信协议（HTTP/RPC/Event）
- [ ] API 定义完整，包含请求/响应模型和错误处理
- [ ] 事件驱动的服务契约有明确的事件定义
- [ ] **组件图已绘制**：provided interface 与 API 定义一一对应
- [ ] **组件图已绘制**：required interface 体现了所有跨 BC 调用
- [ ] 事件发布/订阅在组件图中正确表示
- [ ] tech.md 包含所有 8 个必要章节
- [ ] **项目级 \`docs/sparrow/api.md\` 已更新**，当前 BC 的 API 已录入
- [ ] 跨上下文调用关系和通信协议清晰

---

## 交互上下文设计

> 以下内容适用于**交互上下文**。仅当当前 slug 在 project.md 中标注为「交互上下文」时执行。

### 角色定义

你是一名**前端架构师与 BFF 设计师**，负责为交互上下文生成：
1. **BFF API 契约文档（api.md）**：包含 BFF 聚合端点定义、页面级 ViewModel 接口和聚合序列图
2. **前端技术选型文档（tech.md）**：详细的前端和 BFF 技术栈配置

### 核心原则

1. **不依赖 BC API**：交互上下文的 design 从自身 \`spec.md\` 和 \`frontend.md\` 出发，不读取任何 BC 的 \`api.md\`。契约一致性由 sparrow-arch 阶段的绑定表保证。
2. **页面驱动**：BFF 端点设计以 UI 页面为粒度，一个页面一个 BFF 端点（或一组紧密关联的端点）。
3. **纯聚合不侵入**：BFF 只做数据聚合和格式转换，不做业务逻辑。
4. **契约桩与切换**：BFF 南向网关 port + MockClient / RealClient 由交互上下文设计；MockClient 依据契约绑定表做 fixture，RealClient 从项目级 \`docs/sparrow/api.md\` 取真实端点；切换以契约测试通过为门禁（详见 \`arch/frontend.md\`）。

### 输入文档

| 文档 | 路径 | 用途 |
|------|------|------|
| 交互上下文 spec 切片 | \`docs/sparrow/design/{ui-slug}/spec.md\` | 当前交互上下文关联的业务服务定义 |
| 前端架构文档 | \`docs/sparrow/architecture/frontend.md\` | 契约绑定表 + 技术选型决策 |
| UI 规格文档 | \`docs/sparrow/requirement/ui/ui-spec.md\` | UI 页面清单、用户旅程、交互方式 |

### 设计步骤

#### 步骤1：分析契约绑定表

1. 读取 \`frontend.md\` 中的「API 契约绑定」表
2. 按页面分组，识别每个页面需要聚合哪些 BC 的业务服务
3. 确定哪些交互需要 BFF 聚合（调用多个 BC）vs 直接透传（调用单个 BC）

#### 步骤2：设计 BFF 聚合端点

为每个 UI 页面设计 BFF 端点，格式：

\`\`\`markdown
### BFF: GET /bff/{resource}/{action}

- **服务页面**：{页面名称}
- **聚合的 BC 调用**：
  | 顺序 | 目标 BC | BC 业务服务 | 请求参数 | 降级策略 |
  |------|--------|------------|---------|---------|
  | 1 | {bc-slug} | {SERVICE-ID} | {参数} | {失败时的降级方案} |
  | 2 | {bc-slug} | {SERVICE-ID} | {参数} | {失败时的降级方案} |
- **请求参数**：{聚合后的请求格式}
- **响应格式**：{聚合后的响应格式——ViewModel}
\`\`\`

#### 步骤3：设计 ViewModel

为每个页面定义 ViewModel：

\`\`\`markdown
### ViewModel: {PageName}VM

| 字段名 | 类型 | 来源（BC 业务服务 / 输出字段） | 转换规则 | 说明 |
|--------|------|-------------------------------|---------|------|
| {field} | {type} | {BC.SERVICE.output_field} | {转换规则或"直接映射"} | {字段含义} |
\`\`\`

#### 步骤4：绘制 BFF 聚合序列图

\`\`\`mermaid
sequenceDiagram
    participant UI as UI 页面 (客户端)
    participant BFF as BFF 聚合层
    participant BC1 as {BC1 名称}
    participant BC2 as {BC2 名称}

    UI->>BFF: {BFF 端点请求}
    BFF->>BC1: 调用 {SERVICE-ID}
    BC1-->>BFF: {响应数据}
    BFF->>BC2: 调用 {SERVICE-ID}
    BC2-->>BFF: {响应数据}
    Note over BFF: BFF 聚合转换
    BFF-->>UI: {统一的 ViewModel 响应}
\`\`\`

### api.md 结构（交互上下文）

\`\`\`markdown
# BFF API 契约 — {交互上下文中文名称}

## 1. 交互上下文概述
## 2. BFF 聚合端点列表
## 3. BFF 端点详细定义
### 3.1 {端点名称}
#### 聚合的 BC 调用
#### BFF 聚合序列图
#### 请求定义
#### 响应定义（ViewModel）
## 4. ViewModel 定义汇总
## 5. BFF 组件图（PlantUML）
\`\`\`

### tech.md 结构（交互上下文）

\`\`\`markdown
# 技术选型 — {交互上下文中文名称}

## 1. 客户端技术栈
| 层 | 选型 | 版本 | 说明 |
|------|------|------|------|
| 框架 | | | |
| 构建工具 | | | |
| 语言 | | | |
| UI 组件库 | | | |
| 状态管理 | | | |
| 路由 | | | |

## 2. BFF 聚合层技术栈
| 层 | 选型 | 版本 | 说明 |
|------|------|------|------|
| 运行时 | | | |
| 框架 | | | |
| HTTP 客户端 | | | |

## 3. 构建、测试与部署
## 4. 风险与待决事项
\`\`\`

### 质量检查清单（交互上下文）

- [ ] BFF 端点数量与 UI 页面一一对应
- [ ] 每个 BFF 端点都标注了聚合的 BC 业务服务
- [ ] 每个聚合调用都定义了降级策略
- [ ] ViewModel 字段与 BC 业务服务输出一致（源自同一 spec.md）
- [ ] BFF 聚合序列图正确展示了 UI → BFF → BC 的调用链
- [ ] tech.md 覆盖了客户端和 BFF 两层技术栈
- [ ] 未读取任何 BC 的 api.md（契约一致性由绑定表保证）
- [ ] 每个 BFF 端点已标注下游 BC 契约桩来源（MockClient fixture / RealClient 端点取自项目级 api.md）

## 完成后的下一步

✅ 完成 sparrow-design @{slug} 后，请执行 **sparrow-model @{slug}**（团队级）—— 基于 api.md 中的定义，进行领域建模（后端 BC）或 ViewModel 建模（交互上下文）。

{{PLUGIN:archify}}`;

export const spec: SkillSpec = {
  id: 'sparrow-design',
  name: 'Sparrow Design',
  description: 'Define API contracts and technology stack for a bounded context',
  phase: 'team',
  order: 3,
  nextSkill: 'sparrow-model',
  commandName: 'sparrow-design',
  kind: 'core',
  category: 'DDD',
  harness: ['design/api-design.md'],
  body: DESIGN_BODY,
};
