/**
 * Sparrow Archive skill template.
 *
 * Explicitly archives a change under docs/sparrow/changes/ into
 * docs/sparrow/changes/archive/, finalizing the revise (evolutionary
 * architecture refactoring) workflow.
 */

import { registerSkillTemplate } from '../core/skill-generation.js';

const ARCHIVE_BODY = `# Sparrow Archive — 变更归档

## 用途

将一次**已完成**的变更（revise 模式产生）正式归档。归档后该变更成为基线历史；若再有新需求，将新建 \`changes/{new}/\` 并从 explore 起进入新一轮 revise 模式。

> 本技能**仅显式调用**，绝不自动触发（apply 完成后不会自动归档）。基线（首次需求、无活动变更）无需也不应调用本技能。

## 前置检查

1. 检测活动变更：\`docs/sparrow/changes/\` 下是否存在「未归档」的变更文件夹，或 \`docs/sparrow/project.md\` 的「变更管理」块中「当前活动 change-id」是否非空。
   - **无活动变更** → 提示用户：当前没有待归档的变更，无需归档；直接结束。
2. 确定待归档变更名 \`{change-id}\`。

## 完整性校验（归档前必做）

读取 \`changes/{change-id}/proposal.md\` 与 \`project.md」的「变更管理」块，确认本次变更**受影响 BC** 的实现状态：

- 对每个档位 **S4（代码已生成）** 的 BC：其 \`docs/sparrow/design/{slug}/plan.md\` 所有步骤已标记 \`- [x]\`，且 \`code_review.md\` 已生成。
- 对每个档位 **S1–S3** 的 BC：其对应设计文档（api/tech/model/plan）版本已更新且含 \`change-id\`。
- 若任一受影响 BC 未完成 → 列出未完成项，**询问用户**：(a) 仍要归档（标记部分完成）；(b) 取消，先完成实现。

## 归档步骤

1. 生成归档目录名：\`changes/archive/YYYY-MM-DD-{change-id}/\`（YYYY-MM-DD 为当前日期）。
2. 将 \`changes/{change-id}/\` 整个目录移动到 \`changes/archive/YYYY-MM-DD-{change-id}/\`。
3. 更新 \`docs/sparrow/project.md\` 的「变更管理」块：
   - 清空「当前活动 change-id」（置空或删除该行）。
   - 在「已归档列表」追加一条：
     \`\`\`
     - {change-id} | 归档时间 YYYY-MM-DD | 受影响文档：{文档路径}:v{版本}（逐项列出）
     \`\`\`
4. 更新 \`project.md\` 头部「最后更新」时间戳。

## 归档后的效果

- \`changes/\` 下不再有未归档变更 → 后续若发起新需求，Agent 新建 \`changes/{new}/\` 并进入 revise 模式。
- 历史完整可追溯：每次变更的方案（proposal）、delta、ADR、动作记录均保留于 \`changes/archive/YYYY-MM-DD-{change-id}/\`。

## 质量检查清单

- [ ] 已确认存在活动变更（否则提示并结束）
- [ ] 受影响 BC 的完成状态已校验（或用户确认部分归档）
- [ ] \`changes/{change-id}/\` 已移至 \`changes/archive/YYYY-MM-DD-{change-id}/\`
- [ ] \`project.md\`「变更管理」块：当前 change-id 已清空、已归档列表已追加
- [ ] 时间戳与受影响文档版本已记录

## 完成后的下一步

🎉 变更 \`{change-id}\` 已归档。如发起新的需求变更，从 **sparrow-explore** 开始，系统将自动进入 revise 模式。`;

export function register(): void {
  registerSkillTemplate('sparrow-archive', () => ARCHIVE_BODY);
}
