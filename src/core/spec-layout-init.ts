/**
 * Spec layout created during sparrow init.
 *
 * Creates empty `master/`, `change/current/`, and `change/archive/` directories.
 * Does not pre-fill files or a change-id workspace — those appear when a
 * change-id is confirmed (under current/) or after archive promote (master).
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  SPARROW_DOCS,
  MASTER_ROOT,
  CHANGE_CURRENT,
  CHANGE_ARCHIVE,
} from './spec-paths.js';

export function initializeSpecLayout(projectRoot: string): string[] {
  const created: string[] = [];

  const dirs = [
    join(projectRoot, MASTER_ROOT),
    join(projectRoot, CHANGE_CURRENT),
    join(projectRoot, CHANGE_ARCHIVE),
  ];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      created.push(dir);
    }
  }

  const readmePath = join(projectRoot, SPARROW_DOCS, 'README.md');
  if (!existsSync(readmePath)) {
    writeFileSync(
      readmePath,
      `# Sparrow 规格布局

- **基线（master）**：\`master/\` — init 时为空目录；仅在 archive promote 后写入内容
- **活动变更**：确认 \`{change-id}\` 后创建 \`change/current/{change-id}/\`
- **归档**：\`change/archive/YYYY-MM-DD-{change-id}/\`

未确认 change-id 前不要在 \`change/current/\` 下创建子目录。活动变更 ID 记录在 \`.sparrow/sparrow-state.json\` 的 \`active-change.changeId\`。
`,
      'utf-8'
    );
    created.push(readmePath);
  }

  return created;
}
