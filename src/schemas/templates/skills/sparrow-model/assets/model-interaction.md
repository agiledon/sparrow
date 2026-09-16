# {交互上下文中文名称} - 模型定义

## 1. ViewModel 静态模型

### ViewModel: {PageName}VM

- **页面/组件**：{PageName}
- **数据来源**：

| 来源 BFF 端点 | 来源字段 | 说明 |
|-------------|---------|------|
| GET /bff/{resource} | {field_path} | {说明} |

- **字段定义**：

| 字段名 | 类型 | 来源字段 | 转换规则 | 说明 |
|--------|------|---------|---------|------|
| {viewField} | {type} | {bff_field} | {转换规则或"直接映射"} | {字段含义} |

## 2. 组件树模型

### 组件树：{PageName}

```
{PageComponent}
├── {ChildComponent1}
│   ├── {Grandchild1}
│   └── {Grandchild2}
└── {ChildComponent2}
```

### 组件职责

- **{PageComponent}**：{职责描述}

## 3. 数据流模型

```mermaid
graph LR
    UI[UI 页面] --> Store[状态管理]
    Store --> BFF_EP[BFF 端点]
    BFF_EP --> BC1[{BC1}]
    BFF_EP --> BC2[{BC2}]
```

## 4. ViewModel ↔ BFF 端点映射

| ViewModel | BFF 端点 | 说明 |
|-----------|---------|------|
| {VM Name} | {BFF Endpoint} | {说明} |
