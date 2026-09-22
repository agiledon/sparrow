import { getWorkflowSchema } from '../../kernel/content/schema.js';
import type { ToolCommandAdapter } from '../adapters/types.js';

export function buildHarnessSection(
  adapter: ToolCommandAdapter,
  harnessRelPaths: string[],
): string {
  const conditional = getWorkflowSchema().globalHarness?.conditional ?? [];
  if (harnessRelPaths.length === 0 && conditional.length === 0) return '';

  const lines = [
    '---',
    '',
    '## 📐 约束资产（Harness）',
    '',
    '执行本阶段前，**必须先加载**以下约束资产并严格遵守。它们定义了本阶段**必须遵守 / 禁止**的 DDD 纪律。',
    '',
    '**优先级**：项目级约束 > 全局级约束。内容冲突时以项目级为准；项目级文件不存在时直接使用全局级。',
    '',
  ];
  if (harnessRelPaths.length > 0) {
    lines.push('### 始终加载（always）', '');
    for (const relPath of harnessRelPaths) {
      lines.push(adapter.formatHarnessRef(relPath, 'project'));
      lines.push(adapter.formatHarnessRef(relPath, 'global'));
    }
    lines.push('');
  }
  if (conditional.length > 0) {
    lines.push('### 条件加载（conditional）', '');
    lines.push('满足条件时**必须额外加载**：', '');
    for (const entry of conditional) {
      lines.push(`- \`${entry.path}\` — 当 ${entry.when}`);
      lines.push(adapter.formatHarnessRef(entry.path, 'project'));
      lines.push(adapter.formatHarnessRef(entry.path, 'global'));
      lines.push('');
    }
  }
  return lines.join('\n');
}
