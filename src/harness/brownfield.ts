/**
 * Brownfield (棕地) project constraints — relaxed DDD rigor during as-is spec capture.
 */

export const BROWNFIELD_BODY = `# 棕地项目约束（brownfield）

> 当 \`proposal.md\` 的 \`development-mode\` 为 \`brownfield\` 时，与标准 harness 一并加载；冲突时以本文件对 as-is 探索的放宽规则为准。

## 必须（MUST）

1. **必须基于运行中系统取证**：需求与架构描述须引用代码、配置、API、数据模型或可观测行为，禁止纯臆造。
2. **必须区分 as-is 与 to-be**：规格中明确「当前行为」与「本次增量目标」。
3. **plan 阶段必须经用户选择** \`solidify\`（仅测试计划）或 \`refactor\`（测试 + 重构计划）。

## 禁止（MUST NOT）

1. **禁止**在未理解现有模块边界前强行拆 BC 或重写全栈。
2. **禁止**在 \`solidify\` 模式下在 plan 中加入大规模重构任务。

`;

