# 前端架构（可选）


检查 \`docs/sparrow/change/current/{activeChangeId}/requirement/ui/\` 目录是否存在：

### 如果不存在

UI 规格尚未生成。询问用户：

> 是否已在 sparrow-requirement 阶段进行了 UI 设计探索？
> - 如果用户尚未执行且希望执行，请提示用户先重新执行 **/sparrow-requirement**（选择 update 模式，并选择继续 UI 设计探索），然后返回本阶段继续。
> - 如果用户不需要 UI 设计，则跳过本节，以无前端模式继续。

### 如果存在

读取 UI 规格（\`docs/sparrow/change/current/{activeChangeId}/requirement/ui/ui-spec.md\`、\`docs/sparrow/change/current/{activeChangeId}/requirement/ui/design-tokens.md\`），在架构设计中纳入前端考虑。

> 📐 约束参见 harness \`arch/frontend.md\`。

---

#### 步骤1：技术选型

分别对**客户端**和 **BFF 聚合层**进行技术选型。逐一询问用户，每次提供推荐方案并等待用户确认或修改（遵守 \`common/always/interactive-interaction.md\`；QT 同进程等 follow-up 须在客户端方案确认后再单独询问）。

##### 客户端技术选型

根据 UI 规格中确定的客户端类型，给出推荐方案：

| 客户端类型 | 推荐方案 | 备选方案 |
|-----------|---------|---------|
| Web 中后台 | React (Vite) | Vue3 (Vite)、Next.js、Nuxt3 |
| Web 内容站 | Next.js (SSR) | Astro、Gatsby |
| 移动端（跨平台） | Flutter | React Native、uni-app |
| iOS 原生 | SwiftUI | UIKit |
| Android 原生 | Jetpack Compose | XML Views |
| 桌面客户端（跨平台） | Electron | Tauri、QT/QML |
| 桌面客户端（原生） | QT/QML + C++ | WPF (Win)、SwiftUI (Mac) |
| 小程序 | uni-app | Taro、原生小程序框架 |

询问用户：

> 按照 UI 规格，已识别的客户端类型为 {从 ui-spec 中提取的类型}，推荐的客户端技术方案为 {推荐方案}。是否确认此方案？若需要修改，请告知你选择的技术方案。

**重要**：若用户选择了 QT/QML 或其他原生桌面方案，需特别询问：

> 由于选择了原生桌面客户端，后端 BC 是否运行在同一进程中？如果是，BC 可以不暴露 HTTP 远程服务，改为进程内接口调用。

##### BFF 聚合层技术选型

根据客户端与后端 BC 的部署关系，给出 BFF 技术方案推荐：

| 部署场景 | 推荐方案 | 说明 |
|---------|---------|------|
| BC 为远程服务，客户端为 Web/移动端 | RESTful BFF | BFF 作为独立服务，通过 HTTP 调用各 BC API |
| BC 为远程服务，前端数据需求灵活 | GraphQL BFF | BFF 提供 GraphQL 网关，前端按需查询 |
| BC 与客户端同进程（QT 桌面端） | 进程内 BFF 聚合 | BFF 作为本地模块，通过进程内接口调用各 BC |
| BC 部分远程、部分同进程 | 混合模式 | BFF 同时支持 HTTP 调用和进程内调用 |

询问用户：

> 根据当前的部署架构，推荐的 BFF 方案为 {推荐方案}。BFF 服务的技术栈推荐与客户端保持一致（{推荐技术栈}）。是否确认？若需调整，请告知你的选择。

---

#### 步骤2：交互上下文定义

为当前产品的 UI 定义**交互上下文（Interaction Context）**。交互上下文是与其他限界上下文同级的架构概念，涵盖整个产品的所有客户端 UI 和 BFF 聚合层。

**询问用户交互上下文的标识**：

> 请为交互上下文指定标识：
> - **中文名称**：{提议：基于系统名称 + "交互"，如"电商前台交互"}
> - **英文 slug**（自动提议）：\`frontend\`
>
> 是否确认？若需修改，请告知名称和 slug。

**交互上下文定义**：

\`\`\`markdown
## 交互上下文

- **名称**：{用户确认的中文名称}
- **Slug**：{用户确认的英文 slug}
- **类型**：交互上下文（Interaction Context）
- **范围**：整个产品的所有客户端 UI + BFF 聚合层
- **客户端类型**：{选定的客户端类型}
- **客户端技术栈**：{选定的客户端技术方案}
- **BFF 技术选型**：{选定的 BFF 方案}
\`\`\`

---

#### 步骤3：API 契约一致性绑定

这是**最关键的一步**。在此建立交互上下文与后端限界上下文之间的 API 契约绑定关系，确保前后端契约绝对一致，使得后续各 BC 和交互上下文的 design/model/plan/apply 可以完全独立、正交执行。

##### 绑定规则

1. **业务服务是唯一真相源**：所有契约定义来自 catalog 所链的 `business-services.md#BS-*`。交互上下文的 BFF 聚合调用和 BC 的 API 端点都从同一个业务服务定义推导而来。
2. **请求一致性**：前端发起的请求参数名、类型、必填性必须与对应 BC 的业务服务输入定义完全一致。
3. **响应一致性**：BC API 返回的数据字段必须覆盖 UI 页面的信息展示需求。
4. **无需互读对方产物**：绑定表写入 \`frontend.md\` 后，交互上下文的 design 步骤从自身 \`spec.md\` 和 \`frontend.md\` 推导 BFF API，各 BC 的 design 步骤从自身 \`spec.md\` 推导 BC API。双方无需读取对方产物，契约自然一致。

##### 绑定过程

1. 读取 \`requirement/ui/ui-spec.md\`，提取所有 UI 页面和交互操作
2. 读取 \`requirement/business/catalog.md\` 与其所链 \`business-services.md\`，获取业务服务定义
3. 对于每个 UI 交互操作：
   - 匹配对应的业务服务（通过操作描述和触发事件匹配）
   - 确定该业务服务归属的限界上下文（从步骤二中已确定的 BC 映射）
   - 记录业务服务的输入/输出来自需求文档的定义
4. 生成契约绑定表

##### 契约绑定表格式

\`\`\`markdown
## API 契约绑定

### {页面名称}

| UI 交互操作 | 目标 BC | 业务服务 ID | 请求参数 | 响应数据 | 一致性 |
|------------|--------|------------|---------|---------|:---:|
| {操作描述} | {BC 名称} | {SERVICE-ID} | {输入字段列表} | {输出字段列表} | ✅ |
| {操作描述} | {BC 名称} | {SERVICE-ID} | {输入字段列表} | {输出字段列表} | ✅ |
\`\`\`

**一致性检查规则**：
- ✅ 标记：前端请求参数与业务服务输入定义完全一致，BC 响应满足 UI 展示需求
- ⚠️ 标记：存在不匹配——**必须在此阶段解决**，调整业务服务定义或 UI 交互设计，不得遗留到下游阶段

##### 一致性保障机制

如果发现以下情况，必须在此阶段进行调整：
- 前端需要的字段在业务服务的输出定义中不存在 → 补充业务服务输出定义
- 前端请求参数与业务服务输入定义不匹配 → 统一参数定义
- 一个 UI 交互需要调用多个业务服务 → 在 BFF 聚合层合并，标注多个业务服务和目标 BC

---

#### 步骤4：生成前端架构文档和交互上下文 spec 切片

##### 输出 frontend.md

将以上所有内容写入 \`docs/sparrow/change/current/{activeChangeId}/architecture/frontend.md\`，结构为：

\`\`\`markdown
# 前端架构文档

## 1. 交互上下文
{交互上下文定义}

## 2. 技术选型
### 2.1 客户端
### 2.2 BFF 聚合层

## 3. 前端架构图
{Archify 交互式架构图，展示客户端层 → BFF 聚合层 → 各 BC API}

## 4. API 契约绑定
{契约绑定表}

## 5. 前端代码目录结构
\`\`\`
frontend/
├── features/
│   └── {交互上下文名称}/
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
    └── {按页面或模块组织}
\`\`\`
\`\`\`

##### 创建交互上下文 spec 切片

在 \`docs/sparrow/change/current/{activeChangeId}/design/{ui-slug}/\` 下创建 \`spec.md\`，内容为交互上下文关联的业务服务切片：

\`\`\`markdown
# {交互上下文名称} 业务服务切片

## 关联的限界上下文

| BC | Slug | 关联的业务服务数 |
|----|------|----------------|
| {BC 名称} | {slug} | {数量} |
...

## 业务服务列表

### {BC 名称} 关联服务

#### {SERVICE-ID} {服务名称}
- **输入**：{输入字段}
- **输出**：{输出字段}
- **来源**：\`requirement/business/.../business-services.md#BS-{id}\`（薄投影；Properties 见本切片；以 catalog 链接为准）
...
\`\`\`

##### 更新 project.md

在 \`docs/sparrow/change/current/{activeChangeId}/project.md\` 的「限界上下文设计」部分，将交互上下文与其他 BC 同级列出，并标注类型：

\`\`\`markdown
#### {交互上下文中文名称} (\`{ui-slug}\`) — *交互上下文*
- [spec](./design/{ui-slug}/spec.md) — *v1.0*
- [api](./design/{ui-slug}/api.md) — *待生成*
- [tech](./design/{ui-slug}/tech.md) — *待生成*
- [model](./design/{ui-slug}/model.md) — *待生成*
- [plan](./design/{ui-slug}/plan.md) — *待生成*
\`\`\`

同时在「文档索引」中更新前端架构条目：
\`\`\`markdown
- [x] [前端架构](./architecture/frontend.md) — *v1.0*
\`\`\`

---

