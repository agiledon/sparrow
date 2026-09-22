import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getBundledPlugins } from '../../../plugins/index.js';
import type { Plugin } from '../../../plugins/types.js';
import { getGlobalConfigDir } from '../../harness/install.js';
import { getPluginStatus, markPluginInstalled } from '../../shell/global-config.js';
import { readProjectConfig, writeProjectConfig } from '../../../kernel/runtime/project-config.js';

const PLUGINS_SUBDIR = 'plugins';

interface SpWriterPlugin {
  name: string;
  version: string;
  enabled: boolean;
}

function getGlobalPluginsDir(): string {
  return join(getGlobalConfigDir(), PLUGINS_SUBDIR);
}

function readInstalledVersion(pluginDir: string): string | null {
  try {
    return readFileSync(join(pluginDir, '.version'), 'utf-8').trim();
  } catch {
    return null;
  }
}

function readSparrowConfig(projectRoot: string): Record<string, unknown> {
  return readProjectConfig(projectRoot);
}

function writeSparrowConfig(projectRoot: string, config: Record<string, unknown>): void {
  writeProjectConfig(projectRoot, config);
}

function getProjectPlugins(projectRoot: string): SpWriterPlugin[] {
  const config = readSparrowConfig(projectRoot);
  const plugins = config.plugins;
  if (Array.isArray(plugins)) return plugins as SpWriterPlugin[];
  return [];
}

function upsertProjectPlugin(projectRoot: string, name: string, version: string): void {
  const config = readSparrowConfig(projectRoot);
  let plugins: SpWriterPlugin[] = Array.isArray(config.plugins) ? (config.plugins as SpWriterPlugin[]) : [];
  const existing = plugins.find((p) => p.name === name);
  if (existing) {
    existing.version = version;
  } else {
    plugins.push({ name, version, enabled: true });
  }
  config.plugins = plugins;
  writeSparrowConfig(projectRoot, config);
}

function isPluginEnabled(name: string, projectRoot: string): boolean {
  const projectPlugins = getProjectPlugins(projectRoot);
  const pp = projectPlugins.find((p) => p.name === name);
  if (pp) return pp.enabled !== false;

  const gs = getPluginStatus(name);
  if (gs) return gs.enabled !== false;

  return true;
}

function isPluginAvailable(name: string, projectRoot: string): boolean {
  const gs = getPluginStatus(name);
  if (gs) {
    upsertProjectPlugin(projectRoot, name, gs.version);
    return true;
  }

  const projectPlugins = getProjectPlugins(projectRoot);
  if (projectPlugins.some((p) => p.name === name)) return true;

  return false;
}

function scanPluginRuntime(plugin: Plugin): string[] {
  const written: string[] = [];
  const runtime = plugin.manifest.contributes.runtime;
  if (!runtime) return written;

  const pluginsDir = getGlobalPluginsDir();
  const installDir = join(pluginsDir, plugin.manifest.name);
  const installedVersion = readInstalledVersion(installDir);

  if (installedVersion === plugin.manifest.version) return written;

  mkdirSync(installDir, { recursive: true });
  writeFileSync(join(installDir, '.version'), plugin.manifest.version + '\n', 'utf-8');
  written.push(plugin.manifest.name);

  return written;
}

export function initializePluginRuntimes(projectRoot: string): string[] {
  const pluginsDir = getGlobalPluginsDir();
  mkdirSync(pluginsDir, { recursive: true });

  const written: string[] = [];

  for (const plugin of getBundledPlugins()) {
    const name = plugin.manifest.name;

    if (isPluginAvailable(name, projectRoot)) {
      if (isPluginEnabled(name, projectRoot)) {
        written.push(name + ' (cached)');
      }
      continue;
    }

    markPluginInstalled(name, plugin.manifest.version);
    upsertProjectPlugin(projectRoot, name, plugin.manifest.version);

    const runtimeWritten = scanPluginRuntime(plugin);
    if (runtimeWritten.length > 0) {
      written.push(name + ' (runtime)');
    } else {
      written.push(name + ' (cached)');
    }
  }

  return written;
}
