/**
 * Sparrow Verify skill template.
 *
 * Verifies that a bounded context's code implementation is complete, correct,
 * and consistent with its spec documents (spec.md, api.md, tech.md, model.md).
 */

import type { SkillSpec } from '../core/skills.js';

const VERIFY_BODY = `# Sparrow Verify — 限界上下文实现验证

## 执行顺序检查

\`\`\`
当前步骤：sparrow-verify（第 7 步 / 共 8 步）
所属层级：团队级（team-level），针对特定限界上下文或交互上下文
前置条件：目标 slug 已执行 sparrow-apply（plan.md 全部 \`- [x]\` 且 code_review.md 已生成）
下一步骤：sparrow-archive（第 8 步；仅当验证无阻塞问题时）
\`\`\`

**前置条件检查**：
- 如果用户未指定 slug，从 \`docs/sparrow/project.md\` 列出所有限界上下文（含交互上下文），让用户选择单个 slug、多个 slug，或**全部**
- 对每个选定的 slug，**必须先判定是否已 apply**（见下方「Apply 门禁」）；未 apply 的 slug 提示并跳过

{{HARNESS}}

---

## Apply 门禁（每个 slug 必做）

对选定 slug 依次检查：

1. \`docs/sparrow/design/{slug}/plan.md\` 存在且所有步骤已标记 \`- [x]\`
2. \`docs/sparrow/design/{slug}/code_review.md\` 已生成

**不满足** → 输出：
\`\`\`
⚠️ {slug} 尚未完成 sparrow-apply，无法执行 verify。请先执行 sparrow-apply @{slug}。
\`\`\`
并**跳过**该 slug，继续处理下一个选定 slug。

**全部选定 slug 均未 apply** → 结束执行，不生成验证报告。

---

## 必读规约（每个通过门禁的 slug）

- \`docs/sparrow/design/{slug}/spec.md\` — 场景与验收
- \`docs/sparrow/design/{slug}/api.md\` — 对外契约
- \`docs/sparrow/design/{slug}/tech.md\` — 技术栈与工具链
- \`docs/sparrow/design/{slug}/model.md\` — 领域模型（静态 + 动态）
- 对应产品代码（后端 \`backend/{slug}/\` 或交互上下文 \`frontend/\` + \`edge/bff/\`）

---

## 验证维度

对每个通过 Apply 门禁的 slug，从以下三个维度验证**代码实现 ↔ 规格文档**一致性：

### 1. 完整性（Completeness）

规格文档中定义的内容是否已在代码中实现？

| 检查项 | 对照来源 | 代码位置 |
|--------|---------|---------|
| 业务服务 / 场景 | spec.md | application / api 层 |
| API 端点数量与语义 | api.md | api/command, api/query, BFF 端点 |
| 技术栈与工具链 | tech.md | 项目配置、依赖、基础设施适配器 |
| 聚合根 / 实体 / 值对象 | model.md | domain/aggregate, entity, valueobject |
| 领域服务 / 领域事件 | model.md | domain/service, 事件发布 |
| 序列图交互路径 | model.md | application 层编排 |
| UI 页面与组件（交互上下文） | spec.md + model.md | frontend/features |

### 2. 正确性（Correctness）

已实现的内容是否**准确**反映规格定义？

- 方法签名、DTO 字段、类型语义是否与 api.md / model.md 一致
- 业务规则与验收标准（spec.md）是否在领域层 / 应用层正确 enforced
- 技术选型（tech.md）是否与实际依赖、配置一致
- 命名是否遵循 tech.md / apply 约定（仅风格转换，无语义漂移）

### 3. 一致性（Consistency）

跨文档与跨层之间是否自洽？

- spec.md 中的业务服务 ↔ api.md 端点 ↔ model.md 聚合行为 三者对齐
- model.md 类图 ↔ 代码 domain 层结构 1:1
- api.md 契约 ↔ 集成测试 / 契约测试覆盖
- 同一概念在 spec / api / model / 代码中使用统一语言（Ubiquitous Language）

---

## 严重级别分类

发现问题时，按严重级别分类并给出**建议解决方案**：

| 级别 | 含义 | 示例 | 建议动作 |
|------|------|------|---------|
| **P0 阻塞** | 核心功能缺失或契约严重偏离，无法交付 | spec 定义的服务无对应 API；聚合根缺失 | 回到 sparrow-apply 补实现；必要时 sparrow-model / sparrow-design 修订规格 |
| **P1 严重** | 重要行为错误或规格覆盖明显不足 | 业务规则未 enforced；API 字段类型错误 | 优先修复代码；若规格有误，用 sparrow-supporting-reconcile 对账 |
| **P2 一般** | 非核心偏差，不影响主流程 | 命名风格不一致；次要字段缺失 | 在 apply 阶段修复或记录技术债 |
| **P3 建议** | 优化项、文档细节 | 注释缺失；测试覆盖可加强 | 可选改进，不阻塞下游 |

---

## 输出

对每个验证的 slug，生成验证报告并写入：

\`\`\`
docs/sparrow/design/{slug}/verify_report.md
\`\`\`

报告结构：

\`\`\`markdown
# Verify Report — {slug}

> 生成时间：{ISO_8601}
> 生成者：sparrow-verify
> 验证范围：完整性 / 正确性 / 一致性

## 摘要

- 通过项：N
- P0：N | P1：N | P2：N | P3：N

## 问题清单

### P0 阻塞
- [ ] {问题描述} — **建议**：{解决方案}

### P1 严重
...

## 通过项摘要
...
\`\`\`

更新 \`docs/sparrow/project.md\`：在对应 slug 条目下标注 verify_report.md 版本状态。

---

## 完成后的下一步

### 验证结果判定

- **存在 P0 或 P1 问题** → 列出阻塞项，**不要**提示 sparrow-archive。建议用户先修复（sparrow-apply 或 sparrow-supporting-reconcile），修复后重新执行 **sparrow-verify @{slug}**。
- **无 P0 / P1 问题**（仅 P2 / P3 或无问题）→ 验证通过：

\`\`\`
✅ {slug} 验证通过（无阻塞问题）。

下一步：
- 若还有其他 slug 未 verify，继续 **sparrow-verify @{other-slug}**
- 若所有相关 slug 均已 verify 通过，且存在活动变更（revise 模式），执行 **sparrow-archive** 归档本次变更
- 若为基线项目、无活动变更，verify 完成即可，无需 archive
\`\`\`

> **流水线顺序**：sparrow-apply → **sparrow-verify** → sparrow-archive（revise 模式下、验证通过后）`;

export const spec: SkillSpec = {
  id: 'sparrow-verify',
  name: 'Sparrow Verify',
  description: 'Verify bounded context code against spec.md, api.md, tech.md, and model.md',
  phase: 'team',
  order: 7,
  nextSkill: 'sparrow-archive',
  commandName: 'sparrow-verify',
  kind: 'core',
  category: 'DDD',
  harness: ['apply/implementation.md'],
  body: VERIFY_BODY,
};
