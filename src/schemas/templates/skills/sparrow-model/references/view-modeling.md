## 🖥️ 交互上下文建模

> 以下内容适用于**交互上下文**。仅当当前 slug 在 project.md 中标注为「交互上下文」时执行。

### 角色定义

你是一名 **UI/前端建模专家**，负责为交互上下文进行 ViewModel 和组件建模。

### 建模目标

1. **ViewModel 静态模型**：以页面为粒度，为每个 UI 页面/组件设计 ViewModel
2. **组件树模型**：定义页面组件层级和嵌套关系
3. **BFF 聚合序列图验证**：基于 design 阶段的 BFF 序列图，细化数据流转

### 核心原则

1. **ViewModel ≠ 领域模型**：ViewModel 关注用户体验和页面布局，不关注业务规则。与 DDD 的领域模型彻底分离。
2. **页面为粒度**：每个 UI 页面对应一个或多个 ViewModel
3. **不读 BC 产物**：交互上下文的 model 从自身 api.md 出发，不依赖任何 BC 的领域模型

### 输入文档

| 文档 | 路径 | 用途 |
|------|------|------|
| BFF API 契约 | \`docs/sparrow/change/current/{activeChangeId}/design/{ui-slug}/api.md\` | BFF 端点定义和 ViewModel 接口 |
| 前端技术栈 | \`docs/sparrow/change/current/{activeChangeId}/design/{ui-slug}/tech.md\` | 技术约束 |
| UI 规格 | \`docs/sparrow/change/current/{activeChangeId}/requirement/ui/ui-spec.md\` | 页面结构和交互定义 |

### 建模步骤

#### 步骤1：ViewModel 静态模型

为每个页面定义 ViewModel：

\`\`\`markdown
## ViewModel: {PageName}VM

- **页面/组件**：{PageName}
- **数据来源**：
  | 来源 BFF 端点 | 来源字段 | 说明 |
  |-------------|---------|------|
  | GET /bff/{resource} | {field_path} | {说明} |
- **字段定义**：
  | 字段名 | 类型 | 来源字段 | 转换规则 | 说明 |
  |--------|------|---------|---------|------|
  | {viewField} | {type} | {bff_field} | {转换规则或"直接映射"} | {字段含义} |
\`\`\`

#### 步骤2：组件树模型

定义页面组件层级：

\`\`\`markdown
## 组件树：{PageName}

{PageComponent}
├── {ChildComponent1}
│   ├── {Grandchild1}
│   └── {Grandchild2}
└── {ChildComponent2}

### 组件职责
- **{PageComponent}**：{职责描述}
- **{ChildComponent1}**：{职责描述}
\`\`\`

#### 步骤3：数据流模型

\`\`\`mermaid
graph LR
    subgraph "客户端"
        UI[UI 页面]
        Store[状态管理]
    end
    subgraph "BFF"
        BFF_EP[BFF 端点]
    end
    subgraph "后端"
        BC1[{BC1}]
        BC2[{BC2}]
    end

    UI --> Store
    Store --> BFF_EP
    BFF_EP --> BC1
    BFF_EP --> BC2
    BC1 --> BFF_EP
    BC2 --> BFF_EP
    BFF_EP --> Store
    Store --> UI
\`\`\`

### 输出格式

\`\`\`markdown
# {交互上下文中文名称} - 模型定义

## 1. ViewModel 静态模型
### ViewModel: {PageName}VM
{字段表}

## 2. 组件树模型
### {PageName}
{组件树}

## 3. 数据流模型
{BFF ↔ 各 BC 数据流图}

## 4. ViewModel ↔ BFF 端点映射
| ViewModel | BFF 端点 | 说明 |
|-----------|---------|------|
| {VM Name} | {BFF Endpoint} | {说明} |
\`\`\`

### 质量检查清单（交互上下文）

- [ ] 每个 UI 页面都有对应的 ViewModel
- [ ] ViewModel 字段仅包含 UI 展示需要的字段
- [ ] ViewModel 不包含任何业务逻辑
- [ ] 组件树覆盖了 ui-spec.md 中定义的所有页面
- [ ] 数据流模型与 BFF 聚合序列图一致
- [ ] ViewModel ↔ BFF 端点映射完整无遗漏

