import { readProjectConfig } from '../../kernel/runtime/project-config.js';

export interface ProjectPluginSwitch {
  name: string;
  version?: string;
  enabled?: boolean;
}

export function readProjectPluginSwitches(projectRoot: string): ProjectPluginSwitch[] {
  const plugins = readProjectConfig(projectRoot).plugins;
  if (!Array.isArray(plugins)) return [];
  return plugins.filter((entry): entry is ProjectPluginSwitch => {
    return !!entry && typeof entry === 'object' && typeof (entry as ProjectPluginSwitch).name === 'string';
  });
}

/**
 * Project switch in `.sparrow/sparrow-config.json`.
 * Missing entry or missing `enabled` means the plugin is on.
 * `enabled: false` turns it off. Re-init keeps the stored value.
 */
export function isPluginEnabled(projectRoot: string, name: string): boolean {
  const entry = readProjectPluginSwitches(projectRoot).find((plugin) => plugin.name === name);
  if (!entry) return true;
  return entry.enabled !== false;
}
