import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getGlobalConfigDir } from '../harness/install.js';
import type { PluginEntry } from '../../plugins/types.js';

export interface GlobalConfig {
  version: string;
  plugins: PluginEntry[];
  workflow: Record<string, unknown>;
}

const DEFAULT_CONFIG: GlobalConfig = {
  version: '1',
  plugins: [],
  workflow: {},
};

export function getGlobalConfigPath(): string {
  return join(getGlobalConfigDir(), 'config.json');
}

export function readGlobalConfig(): GlobalConfig {
  try {
    const raw = readFileSync(getGlobalConfigPath(), 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function writeGlobalConfig(config: GlobalConfig): void {
  const dir = getGlobalConfigDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(getGlobalConfigPath(), JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

export function getPluginStatus(name: string): PluginEntry | null {
  const config = readGlobalConfig();
  return config.plugins.find((p) => p.name === name) || null;
}

export function markPluginInstalled(name: string, version: string): void {
  const config = readGlobalConfig();
  const existing = config.plugins.find((p) => p.name === name);
  if (existing) {
    existing.version = version;
    existing.installedAt = new Date().toISOString();
  } else {
    config.plugins.push({
      name,
      version,
      installedAt: new Date().toISOString(),
      enabled: true,
    });
  }
  writeGlobalConfig(config);
}
