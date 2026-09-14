/**
 * API design constraints — service contract discipline.
 */

export const DESIGN_API_BODY = `# API 设计约束（design / api-design）

本文件定义 sparrow-design 阶段**必须遵守 / 禁止**的服务契约与 API 设计纪律。

## 聚焦跨上下文协作

1. **序列图仅体现限界上下文之间以及限界上下文与外部系统（第三方）之间的协作**。
2. API 定义是当前限界上下文**对外公开**的服务契约。
3. **禁止**在 design 阶段涉及 BC 内部实现（领域服务、聚合、数据库操作等），禁止设计内部架构的分层细节。

## 一个业务服务 = 一个 API

1. requirement 阶段识别的每个**业务服务**，对应 design 阶段 actor 向当前 BC 发起的**一次请求**，驱动出一个序列图，进而推导出一个 API 定义。
2. **每个序列图中，actor（参与者 / 其他 BC / 外部系统）向当前 BC 只发起一次请求**。
3. 当前 BC 对外提供了 N 个业务服务（来自 spec.md），则应绘制 N 个独立序列图、定义 N 个 API。

## 序列图绘制纪律

1. 参与者**只包含限界上下文（作为整体）和外部系统**，**绝不包含** BC 内部组件（Command、AppService、聚合、Repository 等）。
2. 每个跨 BC 消息必须标注通信协议（HTTP REST / gRPC / 消息队列）。
3. **禁止**在一个序列图中绘制多个独立的业务服务。

## RESTful 设计原则

1. 使用 HTTP 动词表示操作类型。
2. 使用名词表示资源。
3. 使用复数形式命名资源。
4. 使用嵌套 URL 表示资源关系。

## 组件图纪律

1. provided interface（当前 BC 对外公开的 API）与 \`api.md\` 中的 API 定义**一一对应**。
2. required interface（当前 BC 调用的其他 BC / 外部系统的 API）**体现所有跨 BC 调用**。
3. 事件发布 / 订阅在组件图中正确表示。

## 前端架构（可选，存在 frontend.md 时生效）

> 如果 \`docs/sparrow/architecture/frontend.md\` 存在，则以下纪律生效。

### 序列图起点

1. 序列图的绘制**应从 UI 页面开始**，而非直接从外部系统或 actor 开始。
2. UI 页面作为**边界对象（Boundary Object）**——借鉴 ICONIX 方法论的边界对象概念：它是用户与系统交互的起点，将用户操作转化为对后端服务契约的调用。
3. 序列图流程：**UI 页面（边界对象）→ 边缘层 → 目标限界上下文**。

### 边缘层适配

1. 如果 UI 页面所需的数据结构与对应 BC 的服务契约（消息契约 DTO）**不匹配**，则在边缘层增加 **UI 适配对象（UI Adapter）**，负责转换。
2. 如果 UI 页面的操作需要**同时向多个 BC 的服务契约发起请求**（如订单页面需要同时查询用户 BC 和商品 BC），则在边缘层增加 **服务聚合对象（Service Aggregator）**，负责编排多个 BC 的调用。
3. 边缘层的适配对象和服务聚合对象应在序列图中明确标注角色和职责。`;
