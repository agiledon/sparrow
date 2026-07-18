/**
 * Sparrow Arch skill template.
 *
 * This skill has two phases:
 *   Phase 1: Define business architecture (subdomains + business architecture diagram)
 *   Phase 2: Map to application architecture (bounded contexts + application architecture diagram)
 */

import { registerSkillTemplate } from '../core/skill-generation.js';

const ARCH_BODY = `# Sparrow Arch — 业务架构与应用架构定义

## 执行顺序检查

在执行之前，请检查当前阶段是否合适：

\`\`\`
当前步骤：sparrow-arch（第 2 步 / 共 6 步）
所属层级：产品级（product-level）
前置条件：docs/sparrow/requirement/spec.md 必须存在
下一步骤：sparrow-design（团队级，按限界上下文执行）
\`\`\`

**前置条件检查**：
- 如果 \`docs/sparrow/requirement/spec.md\` 不存在，请提示用户先执行 **sparrow-explore**
- 如果已存在 \`docs/sparrow/architecture/business.md\` 或 \`docs/sparrow/architecture/application.md\`，请参考下方"输出文件存在性检查"章节处理

---

## 🛑 输出文件存在性检查（必须在生成前执行）

在开始生成内容之前，请检查以下输出文件是否已经存在：

- \`docs/sparrow/architecture/business.md\`
- \`docs/sparrow/architecture/application.md\`
- \`docs/sparrow/design/{slug}/spec.md\`（对每个限界上下文）

如果任一文件已存在，请**让用户进行一次选择**（该选择将应用于所有已存在的文件）：

- **跳过 (skip)**：保留已有文件，不执行任何生成操作，停止执行
- **覆盖 (overwrite)**：删除已有文件，重新生成全新的内容
- **更新 (update)**：在已有文件基础上进行修改和完善

> ⚠️ 一次命令只确认一次，用户的选择应用于所有输出文件。

---

## 📋 project.md 更新

完成输出后，**必须**更新 \`docs/sparrow/project.md\`：

1. 如果 \`project.md\` 不存在，根据当前项目信息创建它
2. 在"文档索引"部分，更新 \`architecture/business.md\` 和 \`architecture/application.md\` 的链接，状态改为版本号
3. 在"限界上下文设计"部分，为每个新创建的限界上下文添加子章节：
   \`\`\`markdown
   #### {限界上下文名称} (\`{slug}\`)
   - [spec](./design/{slug}/spec.md) — *v1.0*
   - [api](./design/{slug}/api.md) — *待生成*
   - [tech](./design/{slug}/tech.md) — *待生成*
   - [model](./design/{slug}/model.md) — *待生成*
   - [plan](./design/{slug}/plan.md) — *待生成*
   \`\`\`
4. 更新文件头部的"最后更新"时间戳

**project.md 路径**: \`docs/sparrow/project.md\`

> **变更管理块（惰性，仅 revise 模式）**：\`project.md\` 的「变更管理」块与每个 BC 子章节的「进度档位」标注**仅在活动变更（revise 模式）下**才创建/更新。基线（首次需求、无活动变更）按上文原流程执行，**不写入**变更管理块、不标注档位，保持与未引入变更管理前完全一致。档位判定标准与变更管理块格式见下方「变更处理 / revise」章节及 \`docs/prd/sparrow-change-management.md\`。

---

## 📌 版本元数据管理

所有输出的文档文件**必须在文件开头**包含版本元数据块：

\`\`\`markdown
<!--
  version: v1.0
  last-updated: {ISO_8601_TIMESTAMP}
  generated-by: sparrow-arch
  sparrow-version: {从 .sparrow/sparrow.json 读取}
-->
\`\`\`

**版本规则**:
- **新文档**: 使用 \`v1.0\`
- **更新已有文档**: 读取现有版本号，递增次版本号（\`v1.0\` → \`v1.1\`）
- **重大重写**: 递增主版本号（\`v1.x\` → \`v2.0\`）
- 每次修改都**必须变更**版本号

**操作步骤**:
1. 检查目标文件是否已存在
2. 如果存在，读取文件开头 \`<!--\` 注释块中的 \`version:\` 字段并递增
3. 在文件开头添加或更新版本元数据块
4. 继续生成文档正文

---

## 概述

本阶段分为两个子步骤：

### 子步骤 1：业务架构定义
你是一名专业的**业务架构师**，负责根据业务服务定义文档，遵循 DDD 的子领域要求，识别子领域并绘制业务架构图。

### 子步骤 2：应用架构映射
你是一名专业的**应用架构师**，负责将业务架构映射为应用架构。通过 DDD 战略设计，将子领域映射为限界上下文。

---

# 阶段一：业务架构定义

## 第一性原理

### 1. 价值导向原则
- 子领域划分必须以业务价值为核心，优先识别核心子领域
- 每个子领域都应该为业务目标创造明确的价值

### 2. 内聚性原则
- 同一子领域内的业务服务应该具有高度的内聚性
- 不同子领域之间应该保持松耦合关系

### 3. 战略重要性原则
- 核心子领域是企业的核心竞争力所在，需要投入最优质的资源
- 支撑子领域为业务必需，但非核心竞争力
- 通用子领域应优先考虑购买或使用成熟解决方案

## 子领域分类标准

### 核心子领域 (Core Subdomain)
**定义**：业务成功的关键，是企业的核心竞争力所在。必须投入最大资源，进行精细化建模和定制开发。
**特征**：价值最高，包含创新性的业务逻辑和复杂的业务规则，是竞争对手难以复制的核心能力。
**颜色**：蓝色 (#e1f5fe)

### 支撑子领域 (Supporting Subdomain)
**定义**：业务必需，但非核心竞争力。为核心域服务，需要定制开发，但可以采用相对简单的模型。
**特征**：价值居中，包含重要的业务逻辑但相对标准化，为业务运营提供必要的支撑功能。
**颜色**：紫色 (#f3e5f5)

### 通用子领域 (Generic Subdomain)
**定义**：业界已有成熟解决方案，非业务独有。应优先考虑购买或使用开源方案。
**特征**：价值最低，与垂直领域无关的通用业务，通常可购买或使用开源方案。
**颜色**：绿色 (#e8f5e8)

## 识别步骤指导

### 步骤1：语义相关性分析
根据业务服务的名称，寻找语义相同或相似的名词，优先将其归类到一组。

### 步骤2：功能相关性分析
考虑业务服务要实现的业务目标是否一致，若一致，则考虑归类到一组。

### 步骤3：归纳共同特征
对归类到同一组的所有业务服务逐一对比，归纳它们的共同特征，并进行合理抽象。

**归纳原则**：
- **高内聚松耦合原则**
- **单一抽象层次原则**
- **奥卡姆剃刀原则**
- **最小惊讶法则**
- **清晰边界原则**

## 识别注意事项

1. **避免界面菜单分类影响**：不要受 UI 菜单布局影响
2. **避免动词分类影响**：不同业务服务有相同动词不一定属于同一子领域
3. **避免角色分类影响**：同一角色的多个业务服务不一定属于同一子领域
4. **避免过度抽象**：不要从一开始就建立过高的抽象

## 业务架构图绘制规范

使用 Mermaid 语法。**Mermaid 8.8.0 版本重要要求**：
- 所有 subgraph 名称必须使用**英文双引号** \`"\`，不能使用中文引号
- 节点 ID 不能包含空格，使用下划线或驼峰命名
- 节点标签可以使用中文，建议用引号包裹

\`\`\`mermaid
graph TB
    subgraph "系统范围"
        subgraph "通用子领域"
            C1[子领域C1]
            C2[子领域C2]
        end

        subgraph "支撑子领域"
            B1[子领域B1]
            B2[子领域B2]
        end

        subgraph "核心子领域"
            A1[子领域A1]
            A2[子领域A2]
        end
    end

    classDef coreDomain fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef supportingDomain fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef genericDomain fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px

    class A1,A2 coreDomain
    class B1,B2 supportingDomain
    class C1,C2 genericDomain
\`\`\`

## 输出文档格式（阶段一）

写入 **\`docs/sparrow/architecture/business.md\`**：

\`\`\`markdown
# 1 业务架构

## 1.1 战略目标与商业背景

### 1.1.1 业务愿景
### 1.1.2 要解决的核心业务问题
### 1.1.3 关键业务目标/指标
### 1.1.4 主要限制与假设

## 1.2 业务架构图
[Mermaid 业务架构图]

## 1.3 子领域划分

### 1.3.1 核心子领域
#### 子领域A
- SERVICE-001: 服务名称
- SERVICE-002: 服务名称

### 1.3.2 支撑子领域
### 1.3.3 通用子领域

## 1.4 子领域分析说明
\`\`\`

---

# 阶段二：应用架构映射

## 第一性原理

### 1. 领域驱动原则
- 限界上下文是领域模型的知识语境，拥有明确的业务边界
- 每个限界上下文都应该拥有符合其业务能力的领域知识
- 避免跨上下文的领域概念冲突

### 2. 业务能力导向原则
- 限界上下文是业务能力的纵向切分，而非技术功能的横向分层
- 每个限界上下文都应该具备共同的业务目标
- 对外提供内聚的业务能力，对内管理相关的业务规则

### 3. 技术架构原则
- 服务自治：每个限界上下文应该能够独立部署和运行
- 高内聚低耦合
- 接口稳定性

### 4. 团队组织原则
- 一个限界上下文的所有服务契约都应该归属于同一个团队
- 团队的责任边界应与限界上下文的业务能力保持一致

## 映射过程（必须严格按顺序执行）

### 步骤1：子领域映射为限界上下文（初始映射）
按照一对一的关系，将业务架构中的子领域直接映射为限界上下文：
- **核心子领域** → **核心能力层**
- **支撑子领域** → **公共能力层**
- **通用子领域** → **公共能力层**

### 步骤2：强制优化调整分析（必须执行）
这是**强制性**步骤，必须对每个子领域从以下四个维度进行分析：

#### 2.1 领域模型知识语境冲突分析
- 概念重叠：同一子领域内是否存在语义相近但业务含义不同的概念
- 职责边界：子领域内的服务契约是否服务于不同的业务目标
- 数据一致性：子领域内的数据模型是否存在冲突

#### 2.2 业务能力内聚性分析
- 业务目标一致性
- 功能相关性
- 数据共享程度

#### 2.3 技术因素影响分析
- 复用需求
- 变化频率
- 质量属性要求
- 技术栈差异

#### 2.4 团队组织因素分析
- 团队规模
- 技能匹配
- 交付周期

### 步骤3：限界上下文重构
基于步骤2的分析结果进行重构：
- **上下文分离**：按业务目标、技术特性、团队能力分离
- **上下文合并**：按业务目标、数据依赖、功能耦合合并
- **上下文重组**：按业务价值、技术复杂度、团队组织重组

### 步骤4：验证限界上下文的合理性
- 自治原则验证
- 奥卡姆剃刀原则验证
- 清晰边界原则验证
- 最小惊讶法则验证

## 上下文映射关系模式

1. **防腐层 (ACL)**：下游隔离上游变化
2. **开放主机服务 (OHS)**：上游提供稳定服务接口
3. **遵奉者 (Conformist)**：下游完全遵循上游模型
4. **客户-供应商 (Customer-Supplier)**：明确依赖关系
5. **共享内核 (Shared Kernel)**：共享核心概念和模型

## 应用架构图绘制规范

四层架构：客户端层 → 边缘层 → 核心能力层 → 公共能力层

**Mermaid 8.8.0 语法要求**：
- subgraph 名称使用英文双引号
- 节点 ID 使用英文驼峰命名
- 边标签使用英文引号包裹
- 格式：\`NodeA -->|"关系说明"| NodeB\`

## 输出文档格式（阶段二）

写入 **\`docs/sparrow/architecture/application.md\`**：

\`\`\`markdown
# 应用架构定义文档

## 1. 应用架构图
[Mermaid 四层架构图]

## 2. 限界上下文总览
| 限界上下文 | 承载的主要子域 | 实现建议 |
|-----------|---------------|---------|
| 上下文名称 | 子域类型: 子域名称 | 微服务/模块/SaaS |

## 3. 上下文映射图
[Mermaid 上下文映射图]

## 4. 关系定义与集成策略
| 上游上下文 | 下游上下文 | 关系模式 | 理由与说明 |

## 5. 限界上下文详细设计
为每个限界上下文提供：
- 限界上下文名称（中文 + 英文驼峰命名）
- 关联子域
- 核心职责
- 核心业务规则/不变量
- 关键业务概念
- 统一语言表
- 对外暴露的关键能力
- 技术实现建议
- 服务契约（服务ID: 服务名称）
\`\`\`

## 质量检查清单

- [ ] 每个子领域都正确映射为限界上下文
- [ ] 核心子领域映射到核心能力层
- [ ] 支撑和通用子领域映射到公共能力层
- [ ] 限界上下文之间的依赖关系清晰明确
- [ ] 上下文映射关系模式选择合理
- [ ] 每个限界上下文都有明确的职责边界
- [ ] 服务契约分配合理，无重复或遗漏

## 强制性优化检查清单
- [ ] 识别并解决了概念重叠问题
- [ ] 明确了职责边界
- [ ] 验证了业务目标一致性
- [ ] 评估了功能相关性
- [ ] 识别了复用需求
- [ ] 执行了上下文分离/合并/重组
- [ ] 验证了合理性

## 限界上下文目录创建

完成应用架构定义后，需要为每个限界上下文创建专门的目录：

1. 从 application.md 中提取所有限界上下文的英文 slug
2. 在 \`docs/sparrow/design/{english-slug}/\` 下创建目录
3. 将 \`requirement/spec.md\` 中的业务服务按映射关系切片，写入对应的 \`design/{english-slug}/spec.md\`

---

# 变更处理 / revise（演进式架构重构）

> **⚠️ 门控声明（向后兼容硬性约束）**：本节仅在**检测到活动变更**时进入。判定方法见下方"触发条件"。**若当前为首次需求、无活动变更，请忽略本节，完全按上文原始流程（强制优化调整分析 + 存在性检查 skip/overwrite/update）执行，行为须与未引入本节前完全一致。**

## 触发条件（revise 模式检测）

在执行 arch 之前，先检测是否存在活动变更：

\`\`\`
活动变更存在，当且仅当满足以下任一：
  - docs/sparrow/changes/ 目录存在，且其中包含「未归档」的变更文件夹
    （未归档 = 不在 changes/archive/ 下）
  - docs/sparrow/project.md 的「变更管理」块中「当前活动 change-id」非空
\`\`\`

- **不满足** → 普通模式，跳过本节，按原流程执行（**基线零副作用**）。
- **满足** → 进入 revise 模式：加载 \`docs/sparrow/changes/{change-id}/proposal.md\` 与 \`deltas/\`，执行下方决策框架。

> 完整约定（目录结构、delta 格式、版本元数据扩展、project.md 变更管理块、BC 档位判定）见 \`docs/prd/sparrow-change-management.md\`。各下游阶段（design/model/plan/apply/explore）的 revise 分支均引用本节作为权威定义。

## BC 档位判定（revise 范围精确定界）

revise 模式下，对每个**受变更影响的 BC**，依据 \`project.md\` 的逐 BC 版本记录、\`plan.md\` 步骤是否全 \`[x]\`、\`code_review.md\` 是否存在，判定其进度档位，决定下游改到哪一层（explore 与 arch 始终重跑）：

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

1. **载入 delta**：读取 \`changes/{change-id}/proposal.md\` 与 \`deltas/\` 下各文档（ADDED/MODIFIED/REMOVED 标记）。
2. **重跑业务架构分析**：在现有 \`business.md\` 基础上，识别新增子域、消失服务、模型冲突。
3. **重跑应用架构映射**：将新 BC 提案与现有 BC 对比，算出 diff：新增 BC / 删除 BC / 合并 BC / 拆分 BC / 移动聚合 / 加 ACL / 引绞杀者。
4. **套决策表**：对每个 diff 项产出动作 + 理由，并标注涉及 BC 的档位（决定落地深度）。
5. **破坏性确认**：删除 BC、合并 BC、绞杀者 cutover 三类操作，先向用户展示方案与理由，确认后再执行。
6. **落实**：
   - 更新 \`architecture/business.md\`、\`architecture/application.md\`（MODIFIED 部分按 delta 合并，版本号递增，revise 模式下元数据块追加 \`change-id\` / \`supersedes\`）。
   - 重建 \`design/{slug}/*\`：新建 BC 创建切片目录；合并/拆分按目标重组切片；删除 BC 将其 \`design/{slug}/\` 移入 \`changes/{change-id}/retired/\` 留档后移除索引。
   - 在 \`changes/{change-id}/\` 下写 **ADR**（架构决策记录）：记录初始划分假设、触发变更的需求缺口、本次合并/删除/拆分的判定与理由。
7. **同步上下文映射**：按动作更新上下文映射关系（ACL / OHS / PL / Customer-Supplier 等）。
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
  generated-by: sparrow-arch
  sparrow-version: {从 .sparrow/sparrow.json 读取}
  change-id: {change-name}
  supersedes: v1.0        # 可选，被本变更取代的版本
-->
\`\`\`

## 完成后的下一步

✅ 完成 sparrow-arch 后，请执行 **sparrow-design @{限界上下文slug}**（团队级）—— 为当前选择的限界上下文定义 API 契约和技术栈。

> 若处于 revise 模式且涉及 BC 为 S1–S4，请按对应档位继续 design/model/plan/apply 的 revise 分支；涉及 BC 为 S0 则无需继续下游。变更全部完成后，执行 **sparrow-archive** 归档本次变更。`;

export function register(): void {
  registerSkillTemplate('sparrow-arch', () => ARCH_BODY);
}
