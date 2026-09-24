# 需求约束（requirement / requirements）

本文件定义 sparrow-requirement 阶段**必须遵守 / 禁止**的分层需求、业务服务识别、端到端覆盖及 UI 探索纪律。

> 逐题确认、Grill Me 等互动行为须遵守 **`common/always/interactive-interaction.md`**；本文件不重复该纪律全文。
> 子领域划分纪律见 **`requirement/subdomains.md`**。
> Grill Me 维度顺序见共享 **`grill-me.md`**。

## 活动变更 ID 确认纪律

当需要向用户确定活动变更 `{change-id}`（例如 `docs/sparrow/change/current/` 无子目录、或需新建变更工作区）时：

1. **必须**根据用户已提供的原始需求或变更意图，给出 **1～3 个建议名称**（小写 kebab-case，简短且能概括变更主题，如 `add-order-refund`、`iteration-v2-checkout`）。
2. **必须**明确说明用户可：**接受某一建议**（回复建议名或序号）、**输入自定义名称**（须符合 kebab-case，避免空格与特殊字符），或 **修改**某一建议后再确认。
3. **每次只确认 change-id 这一项**（遵守 `common/always/interactive-interaction.md`）；在用户确认最终名称之前，**禁止**继续追问 development-mode、proposal 内容或进入 Grill Me 下一题。
4. 确认后创建 `docs/sparrow/change/current/{change-id}/`（及 `requirement/business/`、`requirement/quality/`、`requirement/ui/`、`architecture/`、`design/`），由 `ensure-change-workspace.mjs` 按共享模板写入 `project.md`（已存在则不覆盖），再写入 `proposal.md`，并更新 `.sparrow/sparrow-state.json` 的 `active-change.changeId`。
5. **change-id 确认完成前禁止**在 `docs/sparrow/change/current/` 下创建子目录或文件。用户中止或未指定 change-id 时，**`current/` 必须保持为空**，并停止执行。
6. **禁止**在 archive promote 之前向 `docs/sparrow/master/` 写入。首次归档前 master 保持为空。

## 原始需求文档 ingest（MUST / MUST NOT）

**唯一条文源**：本目录 **`requirement/ingest-cli.md`**（与 workflow schema `cliCommands`、SKILL 步骤 4 同步；变更 ingest 纪律时只改该文件，再 `npm run sync-schema`）。

执行 sparrow-requirement 前**必须**阅读 `ingest-cli.md` 全文并遵守。

## 分层产出（MUST）

1. **必须**产出 `requirement/business/catalog.md`（含结构索引与端到端业务流程到业务服务的表）。
2. **必须**按 Grill Me 确认结果写出嵌套树 `{sd-slug}/subdomain.md` 与 `{s-slug}/scenario.md` + `business-services.md`。能力数多于 3 且不止 1 个时写 `{c-slug}/capability.md` 且场景挂在能力下；否则**省略能力层**（不写 `capability.md`、不建 `{c-slug}/`）。
3. **禁止**以单文件 `prd-business.md` 作为主真相源；使用嵌套 `catalog.md` 与 `business-services.md`。
4. 场景**必须**含谁、为何、何时、做什么、何处；业务服务验收标准**必须**使用中文句式（当…时／如果…／在…期间／系统应当…）。

## 端到端业务流程覆盖（MUST）

写完业务服务、进入质量属性或界面规格前，对每条端到端业务流程：

1. **链完整**：步骤有序；相邻步骤交接清晰（角色/触发/前置结果）。
2. **无遗漏**：每个需目标系统处理的步骤都有对应业务服务；缺口须 Grill Me 确认补识别或明确「非本系统」。
3. **无孤儿业务服务**：每个业务服务至少出现在一条端到端业务流程中。
4. **catalog 落盘**：含 `EBP-*`、步骤序号、对应 `BS-*`、涉及 `S-*`/`SD-*`。

## 业务服务（MUST / MUST NOT）

1. **必须全面覆盖**沿端到端业务流程识别出的系统步骤；名称必须为动词短语（动宾）。
2. **必须包含**：服务编号（`BS-*`）、服务名、服务描述、触发事件、基本流程、替代流程、验收标准、追溯（编号 `SD-` / `C-` / `S-` / `EBP-`）。
3. **服务描述格式**："作为<角色>，我想要<服务功能>，以便<服务价值>"。
4. **必须区分**参与者类型：用户（user）、策略（policy）、伴生系统（accompanying system）。
5. **禁止**将「用例」或「模块」识别为业务服务；禁止合并多次独立请求或拆分一次操作；禁止线下/纯前端步骤；禁止纯技术无业务价值功能。

## 判断标准（一次请求原则）

当且仅当以下三个问题的答案都为「是」，才识别为一个独立的业务服务：

- **请求次数**：参与者向目标系统发起了独立的一次请求？
- **独立价值**：该请求完成后产生了明确的、对参与者有价值的业务结果？
- **独立触发**：该请求可以独立触发，而不依赖其他请求先执行？

## Grill Me 提问纪律（阶段一）

1. 遵守 **`common/always/interactive-interaction.md`** 与共享 **`grill-me.md`** 的维度顺序（SD→C→S→EBP→BS→规则→质量）。
2. **不为了提问而提问**：某一维度已经清晰时不再追问。

## Grill Me 提问纪律（阶段三 · UI，可选）

1. 遵守互动纪律与 `grill-me.md`「UI 探索」。
2. **端到端操作流程**必须以已确认 EBP 为输入；禁止另起脱节旅程。
3. 页面覆盖自检：操作流程步 ↔ 页面无断点、无孤儿页。

## 质量属性文档纪律（阶段二）

1. **只覆盖需求探索中实际涉及的维度**，未涉及的维度直接省略。

## UI 设计探索纪律（阶段三）

> 本阶段为**可选阶段**。仅当项目需要前端界面时执行。

### 用户画像纪律

1. 根据场景 Who / 参与者确定用户画像；**禁止**凭空捏造。

### 端到端操作流程纪律

1. **必须**从 catalog 中的 EBP 转换为操作流程（用户操作 + 系统反馈 + 对应 BS + 页面触点）。
2. 每条操作流程**必须**可回溯到 `EBP-*`。
3. **禁止**与业务流程无关的页面；**禁止**为尚不存在的 BS 设计页面。
4. **禁止**在 UI 中关联限界上下文（BC 尚未在 arch 定义）。
5. **必须确保**页面间可导航；原型能走通对应操作流程。

### 原型页面纪律

1. 原型必须可独立打开和交互，使用语义化 HTML，**禁止**仅放置静态截图。
2. 原型交互必须与操作流程一致，并体现设计令牌。
3. 原型是 sparrow-apply 阶段 UI 实现的视觉基准。
