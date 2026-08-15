import type { Plugin } from './types.js';

const _plugins: Plugin[] = [];

export function registerBundledPlugin(plugin: Plugin): void {
  const idx = _plugins.findIndex((p) => p.manifest.name === plugin.manifest.name);
  if (idx >= 0) {
    _plugins[idx] = plugin;
  } else {
    _plugins.push(plugin);
  }
}

export function getBundledPlugins(): Plugin[] {
  return _plugins;
}

export function getAugmentPlugins(): Plugin[] {
  return _plugins.filter((p) => p.manifest.contributes.augments?.length);
}

export function getSkillPlugins(): Plugin[] {
  return _plugins.filter((p) => p.manifest.contributes.skills?.length);
}
