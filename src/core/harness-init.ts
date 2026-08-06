/**
 * Harness initialization.
 *
 * Writes constraint asset templates to:
 *   - Global config dir: ~/.config/sparrow/harness (macOS/Linux), %APPDATA%\sparrow\harness (Windows)
 *   - Project dir:       docs/sparrow/harness (placeholder files)
 *
 * Global files are "managed" (carry a marker). On version upgrade only managed
 * templates are refreshed; user-edited files are never clobbered.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  getHarnessFiles,
  HARNESS_MANAGED_MARKER,
  HARNESS_VERSION,
  type HarnessFile,
} from '../harness/index.js';

/** Version stamp file inside the harness directory. */
const VERSION_FILE = '.version';

/**
 * Resolve the global Sparrow config directory (cross-platform).
 */
export function getGlobalConfigDir(): string {
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA;
    return appData ? join(appData, 'sparrow') : join(homedir(), 'AppData', 'Roaming', 'sparrow');
  }
  return join(homedir(), '.config', 'sparrow');
}

/**
 * Resolve the global harness directory.
 */
export function getGlobalHarnessDir(): string {
  return join(getGlobalConfigDir(), 'harness');
}

/**
 * Resolve the project-level harness directory.
 */
export function getProjectHarnessDir(projectRoot: string): string {
  return join(projectRoot, 'docs', 'sparrow', 'harness');
}

/**
 * Format a reference path to a harness asset for a given scope.
 * Used by adapters to embed constraint references in generated skill files.
 */
export function formatHarnessReference(harnessRelPath: string, scope: 'global' | 'project'): string {
  if (scope === 'global') {
    return join(getGlobalHarnessDir(), harnessRelPath);
  }
  return `docs/sparrow/harness/${harnessRelPath}`;
}

function readInstalledVersion(dir: string): string | null {
  try {
    return readFileSync(join(dir, VERSION_FILE), 'utf-8').trim();
  } catch {
    return null;
  }
}

/**
 * Check whether a harness file still carries the managed marker.
 * User-edited files lose the marker and are preserved on upgrade.
 */
function isManagedFile(dir: string, relPath: string): boolean {
  try {
    const head = readFileSync(join(dir, relPath), 'utf-8').slice(0, 300);
    return head.includes(HARNESS_MANAGED_MARKER);
  } catch {
    return false;
  }
}

function writeGlobalFile(dir: string, file: HarnessFile, overwrite: boolean): boolean {
  const target = join(dir, file.relPath);
  mkdirSync(join(target, '..'), { recursive: true });

  if (existsSync(target) && !overwrite) {
    // Preserve user-customized files (no managed marker) regardless.
    if (!isManagedFile(dir, file.relPath)) return false;
    // Managed template already current — skip.
    if (readInstalledVersion(dir) === HARNESS_VERSION) return false;
  }

  const header = `<!-- ${HARNESS_MANAGED_MARKER} - do not edit manually; edit the project copy instead. -->\n\n`;
  writeFileSync(target, header + file.body, 'utf-8');
  return true;
}

/**
 * Initialize the global harness directory, writing any missing or outdated
 * managed templates. Preserves user-customized files.
 *
 * @returns list of written relPaths
 */
export function initializeGlobalHarness(): string[] {
  const dir = getGlobalHarnessDir();
  mkdirSync(dir, { recursive: true });

  const written: string[] = [];
  for (const file of getHarnessFiles()) {
    if (writeGlobalFile(dir, file, false)) {
      written.push(file.relPath);
    }
  }
  writeFileSync(join(dir, VERSION_FILE), HARNESS_VERSION + '\n', 'utf-8');
  return written;
}

function buildPlaceholderBody(file: HarnessFile): string {
  return `# ${file.title}

> 🏷️ **项目级约束资产（占位文件）**
> 本文件由 \`sparrow init\` 预生成。请将本项目特有的 DDD 约束规则添加到此文件。
>
> **优先级**：项目级约束（\`docs/sparrow/harness/\`）高于全局约束（全局配置目录下的 harness）。内容冲突时以项目级为准。
>
> 若本文件保持为空，执行本阶段时将直接使用全局级约束。

---

## 待添加

- [ ] 项目特有的约束规则（本项目的术语、命名习惯、技术约束等）
- [ ] 与全局约束不同的规则（在此覆盖）

---

## 全局约束参考

全局级约束已自动注入各阶段 skill，无需在此重复。如需查看，可读取全局 harness 的对应文件。

`;
}

/**
 * Initialize the project-level harness directory with placeholder files.
 * Placeholders are created only if they do not exist (never overwritten).
 *
 * @returns list of created relPaths
 */
export function initializeProjectHarness(projectRoot: string): string[] {
  const dir = getProjectHarnessDir(projectRoot);
  mkdirSync(dir, { recursive: true });

  const created: string[] = [];
  for (const file of getHarnessFiles()) {
    const target = join(dir, file.relPath);
    if (existsSync(target)) continue;
    mkdirSync(join(target, '..'), { recursive: true });
    writeFileSync(target, buildPlaceholderBody(file), 'utf-8');
    created.push(file.relPath);
  }
  return created;
}
