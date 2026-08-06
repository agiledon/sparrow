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

1. explore 阶段识别的每个**业务服务**，对应 design 阶段 actor 向当前 BC 发起的**一次请求**，驱动出一个序列图，进而推导出一个 API 定义。
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
3. 事件发布 / 订阅在组件图中正确表示。`;
