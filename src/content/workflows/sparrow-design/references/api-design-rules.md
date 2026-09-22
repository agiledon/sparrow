# 后端 API 设计规则

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

这是连接 requirement 与 design 的关键约束：
- requirement 阶段识别的每个**业务服务**，对应 design 阶段 actor 向当前 BC 发起的**一次请求**
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
1. **业务服务列表文档**：\`docs/sparrow/change/current/{activeChangeId}/design/{slug}/spec.md\`（当前限界上下文的切片需求）
2. **限界上下文定义文档**：\`docs/sparrow/change/current/{activeChangeId}/architecture/bounded-contexts.md\`
3. **架构图中的技术实现建议**（来自 bounded-contexts.md 中对当前上下文的描述）

## 技术选型交互流程

在执行 sparrow-design 时，你需要引导用户进行以下选择（遵守 \`common/always/interactive-interaction.md\`；每次只问一步，确认后再进入下一步）：

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
将用户选定的方案写入 \`docs/sparrow/change/current/{activeChangeId}/design/{slug}/tech.md\`


## 服务契约生成步骤

### 步骤1: 分析业务服务分配
1. 从当前限界上下文的 spec.md 中提取业务服务列表
2. 确定服务契约的调用方式 (HTTP/RPC/Event)
3. 区分哪些是当前 BC 对外提供的服务，哪些依赖其他 BC

### 步骤2: 分析上下文映射关系
1. 从 bounded-contexts.md 中识别当前上下文与其他上下文的关系
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

