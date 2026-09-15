# View Model 建模约束（model / view-modeling）

本文件定义 sparrow-model 阶段**在 slug 为交互上下文时**必须遵守的 View Model 建模纪律。

> ⚠️ 本约束文件仅在当前 slug 为交互上下文（project.md 中标注「交互上下文」）时生效。

## View Model 定位

1. View Model（视图模型）是**为前端 UI 展示和交互而设计的数据模型**，与 DDD 的领域模型分离。
2. View Model 不是领域模型——它只关注**用户体验和页面布局**，不关注业务规则。
3. View Model 建模属于交互上下文，不侵入任何后端 BC 的模型。

## View Model 设计原则

1. **页面为粒度**：每个 UI 页面对应一个或多个 View Model。
2. **组件为单元**：页面中的独立 UI 组件可有独立的 View Model。
3. **最小化数据传输**：View Model 只包含该页面/组件真正需要展示和交互的字段。
4. **单一职责**：一个 View Model 只服务于一个 UI 组件或页面。

## View Model 与 BFF 响应的转换

1. 以交互上下文的 design 阶段生成的 BFF API 规格（api.md）为依据，分析前端需要的 View Model 与 BFF 响应之间的映射。
2. 定义 **ViewModel ↔ BFF 响应转换表**，明确每个字段的来源和转换规则。
3. BFF 响应已经过聚合处理，因此在 ViewModel 层面主要是格式转换（如日期格式、枚举到中文、数值格式化等），而非数据聚合。

## View Model 文档结构

\`\`\`markdown
### ViewModel: {ViewModelName}

- **页面/组件**：{PageName} / {ComponentName}
- **数据来源**：
  | 来源 BFF 端点 | 来源字段 | 说明 |
  |-------------|---------|------|
  | GET /bff/{resource} | {field_path} | {说明} |
- **字段定义**：
  | 字段名 | 类型 | 来源字段 | 转换规则 | 说明 |
  |--------|------|---------|---------|------|
  | {field} | {type} | {source} | {规则或"直接映射"} | {含义} |
\`\`\`

## 禁止事项

1. **禁止**在 View Model 中包含业务逻辑或业务规则。
2. **禁止**直接引用后端 BC 的领域对象（聚合、实体、值对象）。
3. **禁止**在 View Model 中包含数据库查询逻辑。
4. **禁止**为不存在对应 UI 页面的数据定义 View Model。
5. **禁止**在 ViewModel 中进行跨 BC 的数据聚合（该逻辑应在 BFF 层完成）。
