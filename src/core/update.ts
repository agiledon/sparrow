/**
 * Update command application service.
 *
 * Owns version checking, asset sync, and global install. Failures are
 * signaled via typed `UpdateError` so the CLI layer can render the messages
 * and exit codes.
 */

import { execSync } from 'node:child_process';
import { getSparrowVersion } from './package-version.js';
import { isExecSyncTimeoutError } from './exec-errors.js';
import { initializeGlobalHarness, getGlobalHarnessDir } from './harness-init.js';
import { initializePluginRuntimes } from './plugin-init.js';

export type UpdateFailure = 'read-local' | 'timeout' | 'fetch' | 'install';

export class UpdateError extends Error {
  constructor(readonly kind: UpdateFailure) {
    super(`update failed: ${kind}`);
    this.name = 'UpdateError';
  }
}

export function readLocalVersion(): string {
  try {
    return getSparrowVersion();
  } catch {
    throw new UpdateError('read-local');
  }
}

export function fetchLatestVersion(): string {
  try {
    const result = execSync(`npm view sparrow-ddd version`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000,
    });
    return result.trim();
  } catch (e) {
    throw new UpdateError(isExecSyncTimeoutError(e) ? 'timeout' : 'fetch');
  }
}

export function syncAssets(): void {
  const synced = initializeGlobalHarness();
  if (synced.length > 0) {
    console.log('📐 Synced ' + synced.length + ' global constraint asset(s) to ' + getGlobalHarnessDir() + '.');
  }

  const pluginSynced = initializePluginRuntimes(process.cwd());
  if (pluginSynced.length > 0) {
    console.log('🔌 Synced ' + pluginSynced.length + ' plugin runtime(s).');
  }
}

export function installUpdate(latestVersion: string): void {
  console.log('📦 Updating Sparrow to the latest version...');
  try {
    execSync('npm install -g sparrow-ddd@latest', {
      stdio: 'inherit',
      timeout: 60000,
    });
    console.log(`🎉 Sparrow updated to v${latestVersion} successfully.`);
    console.log(
      `📐 全局约束资产将随新版本在下次运行 \`sparrow init\` / \`sparrow update\` 时自动同步到 ${getGlobalHarnessDir()}。`
    );
  } catch {
    throw new UpdateError('install');
  }
}
