# 变更处理 / revise（演进式架构重构）

入口以 `references/revise-gate.md` 为准。未归档时修订当前 change。已完整归档则停在本技能之外，先回到 sparrow-requirement。

对账格式、四种 Delta 与影响范围不在本文重复。本文只定义档位，以及限界上下文划分如何落到规格和代码。

## 限界上下文的档位判定

档位表示这个 slug 的规格已经写到哪一层。它只用来把更下游标为过期，不自动重跑 design、model、plan、apply。

已有代码只看 `backend/{slug}/` 是否存在。不看 `plan.md` 是否全部勾选，也不看 `code_review.md`（完整归档后这两份留在 `archive/`）。

| 档位 | 判定依据 | 含义 |
|---|---|---|
| **S0 仅 arch** | 已有 spec，api/tech/model/plan 待生成 | 未进入 design |
| **S1 design 完成** | 另有 api、tech，model/plan 待生成 | 仅设计契约 |
| **S2 +model** | 另有 model，plan 待生成 | 已领域建模 |
| **S3 +plan** | 另有 plan | 已出实现计划 |
| **S4 已有代码** | `backend/{slug}/` 存在 | 模块已在代码库 |

| 档位 | 本次架构修订 | 代码 |
|---|---|---|
| S0–S3 | 更新本层已有规格为全文；更下游标过期，不提前生成 | 不改 `backend/` |
| S4 | 同样只更新规格并标过期 | 留到用户执行 sparrow-apply，且该 slug 在影响范围里 |

跨档位时（例如合并已有代码的 A 与尚无代码的 B）：有代码的参与者把预定代码动作写入影响范围；没有代码的只改规格。目标新 slug 先完成子领域判断和一对一映射，不在本阶段把下游文档生成到与 A 同级。

## 决策框架：信号 → 动作

基于需求 delta 与现有 arch 四维分析，逐项套用下表。**仅破坏性操作需用户确认**（删除限界上下文 / 合并 / 绞杀者 cutover）。

| 信号 | 重构动作 | 文献依据 | 风险 / 确认 |
|---|---|---|---|
| S5 原限界上下文职责被新需求完全吸收 / 消失 | **删除限界上下文** + 代码并入吸收方 | AR 目录、Strangler | 破坏性 ✅ |
| S2 多限界上下文高度耦合、共享数据、同一团队/目标 | **合并限界上下文**（AR-7 Merge） | Context Mapper AR-7 | 中 ✅ |
| S1 限界上下文内概念冲突 / S4 业务目标分散、可独立部署 | **拆分限界上下文**（AR-2 by Features / AR-3 by Owner） | Context Mapper AR-2/3 | 中（提示） |
| S3 某聚合变化频率显著高于同限界上下文 | **提取聚合**（AR-4 by Volatility / AR-5 by Cohesion） | Context Mapper AR-4/5 | 低 自动 |
| S6 跨限界上下文依赖反向 / 上游模型污染下游 | **防腐层 ACL** | Evans 上下文映射 | 低 自动 |
| S7 上游为遗留/外部系统、需逐步替换 | **绞杀者 Strangler** 并存迁移 | Fowler；MS Architecture Center | 高（cutover 确认）✅ |
| 新职责不属于已有子领域 | **新增限界上下文** | 先按 subdomain-rules，再一对一映射 | 低；映射偏离须写理由 |

划分动作不按档位自动重跑下游，也不在本阶段改代码。参与者里有一个 `backend/{slug}/` 已存在，代码侧就按 S4 记入影响范围；没有代码的只改规格。删除、合并、绞杀者切换必须用户确认。

## arch 在修订时怎么改规格

1. 读取 `proposal.md`、需求 Delta 和现有 `architecture/bounded-contexts.md`。基线按 `revise-gate.md`：同一份 change 对照上一修订版，increment 的新 change 对照 master。
2. 不重划子领域。新增职责是否属于已有子领域，以 requirement 已落盘的 `subdomain.md` 为准。
3. 先一对一映射，再记录调整。偏离必须写理由。算出：新增、分给已有、删除、合并、拆分、移动聚合。
4. 每个动作写入当次影响范围：划分动作、对应子领域、是否已有代码、预定代码动作、是否待确认、要改的路径、因此过期的下游、明确不改的限界上下文。
5. 删除、合并、绞杀者切换先向用户展示方案，确认后再改规格。
6. 落实为全文，不写补丁正文，change 工作区不写 `<!-- version -->`：
   - 更新 `architecture/bounded-contexts.md` 与上下文映射。问题空间变更留在 requirement，不写 `architecture/business.md`。
   - 新增限界上下文：映射成立后才写该 slug 的 `design/{slug}/spec.md`。不在本阶段生成 api、tech、model、plan。
   - 分给已有限界上下文：只更新已经写到的那一层。更下游标过期，不提前生成。
   - 删除且还没有代码：用户确认后，把该 slug 的规格移入 `change/current/{change-id}/retired/`，从索引去掉。不删 `master/` 上的文件。
   - 删除且已有代码：本阶段不删 `backend/{slug}/`。没有接收方则停住，不把删除写成可执行的代码动作。
   - 共享全文随划分一起改：`catalog.md` 只在 requirement 已改时沿用；本阶段改 `bounded-contexts.md`。`architecture/frontend.md` 与 `architecture/api.md` 若已存在且绑定被删 slug，标过期，等用户再次跑对应步骤时改。
7. 调整 `project.md` 的限界上下文索引和档位。变更管理块只更新修订号和对账链接。影响范围写在 `delta.md`，不写进 `project.md`。

代码动作的执行步骤在 sparrow-apply 的 `references/apply-rules.md`。本阶段不改 `backend/`。

## 🖥️ 前端架构（可选）

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

> 由于选择了原生桌面客户端，后端限界上下文是否运行在同一进程中？如果是，限界上下文可以不暴露 HTTP 远程服务，改为进程内接口调用。

##### BFF 聚合层技术选型

根据客户端与后端限界上下文的部署关系，给出 BFF 技术方案推荐：

| 部署场景 | 推荐方案 | 说明 |
|---------|---------|------|
| 限界上下文为远程服务，客户端为 Web/移动端 | RESTful BFF | BFF 作为独立服务，通过 HTTP 调用各限界上下文 API |
| 限界上下文为远程服务，前端数据需求灵活 | GraphQL BFF | BFF 提供 GraphQL 网关，前端按需查询 |
| 限界上下文与客户端同进程（QT 桌面端） | 进程内 BFF 聚合 | BFF 作为本地模块，通过进程内接口调用各限界上下文 |
| 限界上下文部分远程、部分同进程 | 混合模式 | BFF 同时支持 HTTP 调用和进程内调用 |

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

这是**最关键的一步**。在此建立交互上下文与后端限界上下文之间的 API 契约绑定关系，确保前后端契约绝对一致，使得后续各限界上下文和交互上下文的 design/model/plan/apply 可以完全独立、正交执行。

##### 绑定规则

1. **业务服务（Business Service）是唯一真相源**：所有契约定义来自 catalog 所链的 `business-services.md#BS-*`。交互上下文的 BFF 聚合调用和限界上下文的 API 端点都从同一个业务服务定义推导而来。
2. **请求一致性**：前端发起的请求参数名、类型、必填性必须与对应限界上下文的业务服务输入定义完全一致。
3. **响应一致性**：限界上下文 API 返回的数据字段必须覆盖 UI 页面的信息展示需求。
4. **无需互读对方产物**：绑定表写入 \`frontend.md\` 后，交互上下文的 design 步骤从自身 \`spec.md\` 和 \`frontend.md\` 推导 BFF API，各限界上下文的 design 步骤从自身 \`spec.md\` 推导限界上下文 API。双方无需读取对方产物，契约自然一致。

##### 绑定过程

1. 读取 \`requirement/ui/ui-spec.md\`，提取所有 UI 页面和交互操作
2. 读取 \`requirement/business/catalog.md\` 与其所链 \`business-services.md\`，获取业务服务定义
3. 对于每个 UI 交互操作：
   - 匹配对应的业务服务（通过操作描述和触发事件匹配）
   - 确定该业务服务归属的限界上下文（从步骤二中已确定的限界上下文映射）
   - 记录业务服务的输入/输出来自需求文档的定义
4. 生成契约绑定表

##### 契约绑定表格式

\`\`\`markdown
## API 契约绑定

### {页面名称}

| UI 交互操作 | 目标限界上下文 | 业务服务 ID | 请求参数 | 响应数据 | 一致性 |
|------------|--------|------------|---------|---------|:---:|
| {操作描述} | {限界上下文名称} | {SERVICE-ID} | {输入字段列表} | {输出字段列表} | ✅ |
| {操作描述} | {限界上下文名称} | {SERVICE-ID} | {输入字段列表} | {输出字段列表} | ✅ |
\`\`\`

**一致性检查规则**：
- ✅ 标记：前端请求参数与业务服务输入定义完全一致，限界上下文响应满足 UI 展示需求
- ⚠️ 标记：存在不匹配——**必须在此阶段解决**，调整业务服务定义或 UI 交互设计，不得遗留到下游阶段

##### 一致性保障机制

如果发现以下情况，必须在此阶段进行调整：
- 前端需要的字段在业务服务的输出定义中不存在 → 补充业务服务输出定义
- 前端请求参数与业务服务输入定义不匹配 → 统一参数定义
- 一个 UI 交互需要调用多个业务服务 → 在 BFF 聚合层合并，标注多个业务服务和目标限界上下文

---

#### 步骤4：生成前端架构文档和交互上下文 spec 切片

##### 输出 frontend.md

将以上所有内容写入 \`docs/sparrow/change/current/{activeChangeId}/architecture/frontend.md\`，结构为：

\`\`\`markdown
