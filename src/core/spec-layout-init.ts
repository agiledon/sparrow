/**
 * Creates master/change directory skeleton during sparrow init.
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  SPARROW_DOCS,
  SPARROW_DIR,
  ACTIVE_CHANGE_FILE,
  MASTER_ROOT,
  CHANGE_CURRENT,
  CHANGE_ARCHIVE,
  MASTER_REQUIREMENT_HISTORY,
  MASTER_DESIGN_HISTORY,
  MASTER_BC_HISTORY,
} from './spec-paths.js';

const REVISION_HISTORY_HEADER = `# 修订历史

本文件记录 archive promote 时的 ADDED / MODIFIED / REMOVED 摘要。每条须含 synced-at（同步日期）。

`;

const BC_HISTORY_HEADER = `# 限界上下文拓扑修订历史

记录 BC 新增、删除、拆分、合并、内容重分配。每条须含操作类型、目的、后果及用户确认记录。

`;

export function initializeSpecLayout(projectRoot: string): string[] {
  const created: string[] = [];
  const dirs = [
    join(projectRoot, MASTER_ROOT, 'requirement', 'business'),
    join(projectRoot, MASTER_ROOT, 'requirement', 'quality'),
    join(projectRoot, MASTER_ROOT, 'requirement', 'ui'),
    join(projectRoot, MASTER_ROOT, 'architecture'),
    join(projectRoot, MASTER_ROOT, 'design'),
    join(projectRoot, CHANGE_CURRENT),
    join(projectRoot, CHANGE_ARCHIVE),
    join(projectRoot, SPARROW_DOCS, 'harness'),
  ];

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      created.push(dir);
    }
  }

  const historyFiles: { path: string; header: string }[] = [
    { path: join(projectRoot, MASTER_REQUIREMENT_HISTORY), header: REVISION_HISTORY_HEADER },
    { path: join(projectRoot, MASTER_DESIGN_HISTORY), header: REVISION_HISTORY_HEADER },
    { path: join(projectRoot, MASTER_BC_HISTORY), header: BC_HISTORY_HEADER },
  ];

  for (const { path, header } of historyFiles) {
    if (!existsSync(path)) {
      writeFileSync(path, header, 'utf-8');
      created.push(path);
    }
  }

  const activeChangePath = join(projectRoot, ACTIVE_CHANGE_FILE);
  if (!existsSync(activeChangePath)) {
    mkdirSync(join(projectRoot, SPARROW_DIR), { recursive: true });
    writeFileSync(activeChangePath, JSON.stringify({ changeId: null }, null, 2) + '\n', 'utf-8');
    created.push(activeChangePath);
  }

  const readmePath = join(projectRoot, SPARROW_DOCS, 'README.md');
  if (!existsSync(readmePath)) {
    writeFileSync(
      readmePath,
      `# Sparrow 规格布局

- **基线（master）**：\`master/\` — 已 archive promote 的规格与 \`master/project.md\`
- **活动变更**：\`change/current/{change-id}/\` — 8 步流水线工作区
- **归档**：\`change/archive/YYYY-MM-DD-{change-id}/\`

活动变更 ID：\`.sparrow/active-change.json\`

详见 \`docs/prd/sparrow-change-management.md\`。
`,
      'utf-8'
    );
    created.push(readmePath);
  }

  return created;
}
