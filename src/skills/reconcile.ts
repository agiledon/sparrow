/**
 * Sparrow Reconcile skill template.
 *
 * Auxiliary command for reconciling existing spec docs and harness constraints
 * with current code and conversation history after vibe coding or bugfixes.
 */

import type { SkillSpec } from '../core/skills.js';

const RECONCILE_BODY = `# Sparrow Reconcile — 规格对账

## 用途

这是一个**辅助命令**（\`kind: supporting\`），与 DDD 流水线阶段**无关，可随时调用**。

宿主 Agent 在 **vibe coding**（新增特性）或 **bugfix** 后，代码实现与规格文档产生漂移时，本命令根据**当前对话历史**和**代码真实实现**，将**已存在的**规格文档与 harness 约束资产**对齐到实现**。

> 本技能是**事后对账**（code → docs），不是 revise 流程的事前规划（docs → code）。

## 硬性边界（必须遵守）

### 禁止事项

1. **不修改架构划分**：不改动子领域分类、限界上下文边界、上下文映射、BC slug 列表。
   - **只读不写**：\`architecture/business.md\`、\`architecture/application.md\`、\`architecture/frontend.md\`
   - **禁止**新建 \`design/{slug}/\` 目录、禁止新增 BC slug
2. **不创建不存在的规格文档**：目标文件必须已存在于 \`docs/sparrow/\` 下；不存在则**跳过并在跳过清单中记录**，绝不生成新文件。
3. **不修改 \`plan.md\`**：实现计划由 sparrow-plan 单独维护；本技能只读不写 plan.md。
4. **不触发 revise 流程**：不自动创建 \`changes/{change-id}/\`、不自动触发 sparrow-supporting-archive。

### 允许事项

- 在**已存在**的规格文档上原地更新内容，消除与代码 / 对话决策的漂移
- 在**已存在**的 harness 约束文件上追加或修正 Must / Must Not 规则

## 可写目标文件（须已存在）

| 层级 | 路径 | 前提 |
|------|------|------|
| 产品需求 | \`requirement/prd-business.md\` | 文件存在 |
| 质量属性 | \`requirement/prd-quality.md\` | 文件存在 |
| UI 规格 | \`requirement/ui/**\` | 各文件存在 |
| BC 业务规格 | \`design/{slug}/spec.md\` | slug 已在 project.md 中列出且文件存在 |
| BC 契约 | \`design/{slug}/api.md\`、\`tech.md\` | 同上 |
| BC 领域模型 | \`design/{slug}/model.md\` | 同上 |
| Harness 约束 | \`docs/sparrow/harness/**\` | 文件存在 |

加载 \`docs/sparrow/project.md\` 获取已有 slug 列表，**仅遍历已存在的 \`design/{slug}/\` 目录**。

## 执行流程

### 阶段 1：证据收集

1. 读取当前对话历史：用户意图、已确认的决策、实现细节讨论
2. 对比代码现状：优先 \`git diff\` / 工作区变更；若无 git，扫描与对话相关的实现文件
3. 读取 \`docs/sparrow/project.md\` 获取已有 slug 与文档索引

### 阶段 2：基线加载（仅已存在文件）

按上表加载所有**已存在**的目标文件。输出两份清单：

- **已加载**：本次可能对账的文件列表
- **已跳过**：不存在的文件 / 未注册的 slug（附跳过原因）

### 阶段 3：差异分析与分类

| 变更类型 | 判定依据（示例） | 对账目标（须已存在） |
|----------|------------------|---------------------|
| 业务需求 | 业务服务、流程、验收标准、用户可见行为变化 | \`design/{slug}/spec.md\` + \`requirement/prd-business.md\` |
| 技术决策 / 质量属性 | API 契约、技术栈、架构模式、NFR（性能/安全/可用性） | \`design/{slug}/api.md\`、\`tech.md\` + \`requirement/prd-quality.md\` |
| 领域模型 | 聚合/实体/值对象/领域事件变化 | \`design/{slug}/model.md\` |
| UI 界面 | 页面结构、交互、设计令牌、组件、原型 | \`requirement/ui/**\` |
| Harness 约束 | 编码纪律、Must/Must Not 规则（非业务/契约内容） | \`docs/sparrow/harness/{stage}/*.md\` |

### 阶段 4：规格 vs 约束区分

- **规格（Spec）**：描述系统**是什么**——业务服务、API 契约、领域模型、UI 行为、质量属性
- **约束（Harness）**：描述团队**必须怎么做**——阶段纪律、编码规范、禁止项

**启发式**：

- 若变更可用「新增了 X 功能 / Y 接口 / Z 页面」描述 → **规格**
- 若变更可用「实现时必须 / 禁止」描述 → **harness**

写入 harness 时使用 Must/Must Not 格式，按 sparrow-supporting-harness 的分类表路由到对应阶段文件。

### 阶段 5：用户确认与写入

1. 输出**变更清单**（文件路径 + 变更摘要 + 分类 + 跳过项），请用户确认后再写入
2. 遵循版本元数据规范（复用 explore/design 中的 \`<!-- version: ... -->\` 块；次版本递增）
3. 更新 \`docs/sparrow/project.md\` 的「最后更新」时间戳及已修改文档的版本状态
4. **不改动** project.md 中的 BC 列表结构、slug 条目或架构文档链接

## 与 revise 流程的关系

| | sparrow-supporting-reconcile | revise 流程 |
|--|--------------------------|---------------|
| 时机 | 事后（vibe coding / bugfix 后） | 事前（规划演进架构变更） |
| 架构 | 不修改子领域 / BC 划分 | 可修改架构、新增 BC |
| 入口 | 随时显式调用 | explore 检测到活动 change-id |
| 归档 | 不触发 | 完成后 sparrow-supporting-archive |

若检测到活动 change-id（\`docs/sparrow/changes/\` 有未归档变更），提示用户：**架构级变更应走 revise 流程；reconcile 仅对齐已有规格，不替代 revise**。

## 质量检查清单

- [ ] 已收集对话历史与代码变更证据
- [ ] 仅加载已存在的规格文件；跳过清单已输出
- [ ] 未修改任何 \`architecture/*.md\`
- [ ] 未新建 BC slug 或 \`design/{slug}/\` 目录
- [ ] 未修改 \`plan.md\`
- [ ] 变更清单已获用户确认
- [ ] 版本元数据已递增
- [ ] \`project.md\` 时间戳已更新（BC 列表结构未变）`;

export const spec: SkillSpec = {
  id: 'sparrow-supporting-reconcile',
  name: 'Sparrow Reconcile',
  description: 'Reconcile existing spec docs and harness constraints with current code and conversation history',
  phase: 'team',
  order: 102,
  nextSkill: null,
  commandName: 'sparrow-supporting-reconcile',
  kind: 'supporting',
  category: 'DDD',
  harness: [],
  body: RECONCILE_BODY,
};
