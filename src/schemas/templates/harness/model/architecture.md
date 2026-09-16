# 领域建模架构约束（model / architecture）

本文件定义 sparrow-model 阶段必须遵守的 **DDD 四层结构、角色构造型与调用纪律**。

## 四层结构

1. 代码模型必须遵循 DDD 四层结构：
   - **api（北向网关）**、**application（北向网关）**、**domain（领域核心）**、**infrastructure（南向网关）**
2. **infrastructure（南向网关）分为 port（端口）和 adapter（适配器）**。
3. 必须遵循**菱形对称架构**：api 层和 infrastructure 层对称地围绕 domain 层，**domain 层不依赖任何外层**。

## 角色构造型（7 种，各司其职）

| 角色 | 层 | 说明 |
|------|---|------|
| 远程服务 | api | REST Resource、MVC Controller、RPC Provider、Event Subscriber —— 北向网关入口 |
| 本地服务 | application | DDD 应用服务（AppService），编排领域层与基础设施层 |
| 消息契约 | api → DTO；infrastructure → PO | api 层：Command / Query / Request / Response / ApplicationEvent；infrastructure 层：PersistentObject（持久化对象） |
| 领域服务 | domain | DomainService，封装不自然属于任何单一聚合的领域逻辑，无状态 |
| 聚合 | domain | AggregateRoot + Entity + ValueObject，持有业务状态和行为 |
| 端口 | infrastructure/port | 抽象接口定义：Repository（数据库/存储）、Client（跨 BC/外部系统调用）、Publisher（事件发布） |
| 适配器 | infrastructure/adapter | 端口的具体实现（如 JPA Repository、HTTP Client、MQ Publisher） |

## 持久化对象（PO）纪律

1. 若 ORM 引入了持久化对象（PO），则 **PO 属于南向网关的消息契约**。
2. PO **必须负责持久化对象与聚合的双向转换**，不允许将领域对象直接暴露给 ORM。
3. **端口的接口定义禁止出现领域层之外的对象类型**（如 DTO、PO、框架特定类型），只能使用领域层类型（聚合、实体、值对象）和基本类型。

## 角色调用规则

### 允许调用

| 调用方 | 被调用方 |
|--------|---------|
| 远程服务（Command / Query） | 应用服务、消息（DTO） |
| 应用服务（AppService） | 领域服务、端口、消息（DTO） |
| 领域服务 | 领域服务、聚合、端口 |
| 聚合 | 其他聚合 |
| 端口 | 聚合 |

### 禁止调用

1. **应用服务 → 聚合**：应用服务不能直接访问聚合，必须通过领域服务或端口。
2. **聚合 → 领域服务**：聚合不调用领域服务。
3. **聚合 → 端口**：聚合不直接访问端口（Repository / Client / Publisher）。
4. **聚合 → 远程服务 / 消息**：聚合不访问 api 层任何类型。
5. **消息（DTO / PO）→ 远程服务、应用服务、端口转换之外的对象**：消息只作为数据传输载体。
6. **远程服务 → 领域服务 / 聚合 / 端口**：远程服务只能编排应用服务。

## 前端代码模型结构（可选，交互上下文存在时生效）

> 此约束适用于交互上下文的 model 和 apply 阶段。

### 前端分层

1. 前端代码按交互上下文组织：
   - **pages**：路由页面组件
   - **components**：可复用的 UI 组件
   - **services**：调用 BFF 端点的服务层
   - **adapters**：ViewModel ↔ BFF 响应转换
   - **stores**：状态管理

### 前端目录结构

\`\`\`
frontend/
├── features/
│   └── {feature-name}/
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── adapters/
│       └── stores/
├── shared/
│   ├── components/
│   ├── styles/
│   └── utils/
└── shell/

edge/
└── bff/
    └── {page-or-feature}/
        └── *Aggregator
\`\`\`

### 前端依赖方向

1. pages → components + services
2. services → adapters
3. adapters → BFF types
4. services → BFF endpoints (via edge/bff/)
3. **禁止** components 直接调用 services（组件只接收 Props/Events）
4. **禁止** adapters 引用 pages 或 components