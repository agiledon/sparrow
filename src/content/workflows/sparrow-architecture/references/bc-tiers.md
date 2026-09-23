# 变更处理 / revise（演进式架构重构）

> **⚠️ 门控声明（向后兼容硬性约束）**：本节仅在**检测到活动变更**时进入。判定方法见下方"触发条件"。**若当前为首次需求、无活动变更，请忽略本节，完全按上文原始流程（强制优化调整分析 + 存在性检查 skip/overwrite/update）执行，行为须与未引入本节前完全一致。**

## 触发条件（revise 模式检测）

在执行 arch 之前，先检测是否存在活动变更：

\`\`\`
活动变更存在，当且仅当满足以下任一：
  - docs/sparrow/change/current/ 目录存在，且其中包含「未归档」的变更文件夹
    （未归档 = 不在 change/archive/ 下）
  - docs/sparrow/change/current/{activeChangeId}/project.md 的「变更管理」块中「当前活动 change-id」非空
\`\`\`

- **不满足** → 普通模式，跳过本节，按原流程执行（**基线零副作用**）。
- **满足** → 进入 revise 模式：加载 \`docs/sparrow/change/current/{change-id}/proposal.md\` 与 change 工作区相对 master 的 diff，执行下方决策框架（BC 拓扑变更须用户确认清单）。

> 完整约定（目录结构、delta 格式、版本元数据扩展、project.md 变更管理块、BC 档位判定）见 \`docs/prd/sparrow-change-management.md\`。各下游阶段（design/model/plan/apply/requirement）的 revise 分支均引用本节作为权威定义。

## BC 档位判定（revise 范围精确定界）

revise 模式下，对每个**受变更影响的 BC**，依据 \`project.md\` 的逐 BC 版本记录、\`plan.md\` 步骤是否全 \`[x]\`、\`code_review.md\` 是否存在，判定其进度档位，决定下游改到哪一层（requirement 与 arch 始终重跑）：

| 档位 | 判定依据 | 含义 |
|---|---|---|
| **S0 仅 arch** | spec=v，api/tech/model/plan=待生成 | 未进入 design |
| **S1 design 完成** | +api=v, tech=v，model/plan=待生成 | 仅设计契约 |
| **S2 +model** | +model=v，plan=待生成 | 已领域建模 |
| **S3 +plan** | +plan=v | 已出实现计划 |
| **S4 applied** | plan 全 \`[x]\` 且 \`code_review.md\` 存在 | 代码已生成 |

| 受影响 BC 档位 | revise 改动范围 | 是否动代码 |
|---|---|---|
| S0 仅 arch | 只改 arch 产物（business/application + 该 BC 的 design/spec 切片）+ 记录变更原因（轻量 ADR） | 否 |
| S1 design 完成 | arch + design（api/tech）重生成 | 否 |
| S2 +model | arch + design + model | 否 |
| S3 +plan | arch + design + model + plan | 否 |
| S4 applied | 全量修订流程（含代码 Strangler/ACL/迁移/退役，见 sparrow-apply） | 是 |

> 跨档位动作（如合并 A=S4 与 B=S1 为 C）：对每个参与 BC 按其档位分别处理；新建目标 C 正向执行到「与最先进源 BC 同级」。

## 决策框架：信号 → 动作（Agent 自动判定）

基于需求 delta 与现有 arch 四维分析，逐项套用下表。**仅破坏性操作需用户确认**（删除 BC / 合并 / 绞杀者 cutover）。

| 信号 | 重构动作 | 文献依据 | 风险 / 确认 |
|---|---|---|---|
| S5 原 BC 职责被新需求完全吸收 / 消失 | **删除 BC** + 代码并入吸收方 | AR 目录、Strangler | 破坏性 ✅ |
| S2 多 BC 高度耦合、共享数据、同一团队/目标 | **合并 BC**（AR-7 Merge） | Context Mapper AR-7 | 中 ✅ |
| S1 BC 内概念冲突 / S4 业务目标分散、可独立部署 | **拆分 BC**（AR-2 by Features / AR-3 by Owner） | Context Mapper AR-2/3 | 中（提示） |
| S3 某聚合变化频率显著高于同 BC | **提取聚合**（AR-4 by Volatility / AR-5 by Cohesion） | Context Mapper AR-4/5 | 低 自动 |
| S6 跨 BC 依赖反向 / 上游模型污染下游 | **防腐层 ACL** | Evans 上下文映射 | 低 自动 |
| S7 上游为遗留/外部系统、需逐步替换 | **绞杀者 Strangler** 并存迁移 | Fowler；MS Architecture Center | 高（cutover 确认）✅ |
| 新子域出现 | **新增 BC** | — | 低 自动 |

**「按状态执行」列**：上述每个动作的落地深度随涉及 BC 的档位而异——
- 涉及 BC 为 **S0**：仅改 arch 产物 + 记录轻量 ADR，**不触发下游重生成、不动代码**。
- 涉及 BC 为 **S1–S3**：按档位向上重生成对应层设计文档（api/tech/model/plan），未达档位不碰。
- 涉及 BC 为 **S4**：走全量修订流程，含代码迁移（见 sparrow-apply 的「重构迁移」子流程）。

## arch 在 revise 模式的执行步骤

1. **载入变更**：读取 \`change/current/{change-id}/proposal.md\` 与 change 工作区需求/架构产物，对照 \`master/\`（ADDED/MODIFIED/REMOVED 标记）。
2. **核对问题空间结构**：在现有 \`requirement/business/\`（catalog / subdomains / services）基础上，识别新增子域、消失服务、模型冲突；**禁止**在 arch 重划子领域。
3. **重跑限界上下文映射**：将新 BC 提案与现有 BC 对比，算出 diff：新增 BC / 删除 BC / 合并 BC / 拆分 BC / 移动聚合 / 加 ACL / 引绞杀者。
4. **套决策表**：对每个 diff 项产出动作 + 理由，并标注涉及 BC 的档位（决定落地深度）。
5. **破坏性确认**：删除 BC、合并 BC、绞杀者 cutover 三类操作，先向用户展示方案与理由，确认后再执行。
6. **落实**：
   - 更新 \`architecture/bounded-contexts.md\`（MODIFIED 部分按 delta 合并，版本号递增，revise 模式下元数据块追加 \`change-id\` / \`supersedes\`）。问题空间变更在 requirement 侧更新，不写 \`architecture/business.md\`。
   - 重建 \`design/{slug}/*\`：新建 BC 创建切片目录；合并/拆分按目标重组切片；删除 BC 将其 \`design/{slug}/\` 移入 \`change/current/{change-id}/retired/\` 留档后移除索引。
   - 在 \`change/current/{change-id}/\` 下写 **ADR**（架构决策记录）：记录初始划分假设、触发变更的需求缺口、本次合并/删除/拆分的判定与理由。
7. **同步上下文映射**：按动作更新上下文映射关系（ACL / OHS / Conformist / Customer-Supplier / Shared Kernel / Publisher-Subscriber / Separate Ways 等）。
8. **更新 project.md**：调整「限界上下文设计」索引（增/删/合/拆对应子章节与版本），并为每个 BC 标注档位；在「变更管理」块记录本次变更影响的文档与版本。

## BC → 代码映射（revise 后的代码处理，由 sparrow-apply 执行）

因 \`backend/\` 下每个 BC 是独立模块（sparrow-apply 约定），架构动作直接映射为代码动作（仅当涉及 BC 为 S4 时执行）：

- **新增 BC** → 对新 slug 跑 design→apply，建新模块。
- **合并 A+B→C** → Strangler 式：① 保留 A、B 模块，建协调/ACL 模块 C 委派；② 行为+数据迁入 C；③ cutover 重定向调用方到 C；④ 退役 A、B（归档后删）。
- **删除 BC** → 行为已随合并并入吸收方 → 移除非空模块；若有外部调用方，先留薄兼容 shim/ACL，再退役。
- **移动聚合（X 从 A→B）** → 搬迁 \`domain/aggregate|entity|valueobject/\` + \`infrastructure/port|adapter/\` 到 B 模块；同步 A、B 的 api/model；跨 BC 调用方经 ACL 保持聚合外部契约稳定。
- **防腐层 ACL** → 仅新增 \`infrastructure/adapter/acl/\`（或独立 ACL 模块）做模型翻译，不动本地领域模型。
- **绞杀者** → 旧模块保留，新模块并行，经 facade/特性开关路由，并存期双写或事件桥接，cutover 后退役旧模块。
- **数据迁移** → 若 tech.md 标明「每 BC 独立 schema」，合并/拆分即跨模块 schema 迁表，并存期双写/CDC，再 cutover。
- **回归校验** → 变更后重跑架构边界/适配度检查（ArchUnit 式 fitness function）+ 现有 \`code_review.md\`，确保新模块边界未退化；bump 代码版本。

> 详细代码迁移步骤见 **sparrow-apply** 的「重构迁移」子流程。

## 版本元数据扩展（revise 模式）

基线（普通模式）输出当前 4 字段（不变）。revise 模式在更新已有文档时，于元数据块追加可选字段：

\`\`\`markdown
<!--
  version: v1.1
  last-updated: {ISO_8601_TIMESTAMP}
  generated-by: sparrow-architecture
  sparrow-version: {从 .sparrow/sparrow-config.json 读取}
  change-id: {change-name}
  supersedes: v1.0        # 可选，被本变更取代的版本
-->
\`\`\`

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
