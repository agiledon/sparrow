import type { Plugin } from './types.js';

const _plugins: Plugin[] = [];

export function registerBundledPlugin(plugin: Plugin): void {
  _plugins.push(plugin);
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
