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
4. **契约桩与切换**：BFF 南向网关 port + MockClient / RealClient 由交互上下文设计；MockClient 依据契约绑定表做 fixture，RealClient 从项目级 \`docs/sparrow/change/current/{activeChangeId}/architecture/api.md\` 取真实端点；切换以契约测试通过为门禁（详见 \`arch/frontend.md\`）。

### 输入文档

| 文档 | 路径 | 用途 |
|------|------|------|
| 交互上下文 spec 切片 | \`docs/sparrow/change/current/{activeChangeId}/design/{ui-slug}/spec.md\` | 当前交互上下文关联的业务服务定义 |
| 前端架构文档 | \`docs/sparrow/change/current/{activeChangeId}/architecture/frontend.md\` | 契约绑定表 + 技术选型决策 |
| UI 规格文档 | \`docs/sparrow/change/current/{activeChangeId}/requirement/ui/ui-spec.md\` | UI 页面清单、用户旅程、交互方式 |

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

