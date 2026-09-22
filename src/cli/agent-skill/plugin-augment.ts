import { getBundledPlugins } from '../../plugins/index.js';

/** Token pattern for augment plugin injection: {{PLUGIN:<pluginId>}} */
const PLUGIN_TOKEN_RE = /\{\{PLUGIN:([\w-]+)\}\}/g;

export function injectAugmentPlugins(body: string, workflowId: string): string {
  return body.replace(PLUGIN_TOKEN_RE, (match, pluginId) => {
    const plugin = getBundledPlugins().find((p) => p.manifest.name === pluginId);
    if (!plugin) return match;

    const augment = plugin.manifest.contributes.augments?.find(
      (a) => a.targetSkill === workflowId,
    );
    if (!augment) return match;

    const key = augment.contentFile || 'SKILL.md';
    const content = plugin.augmentContents[key] || plugin.skillContent;
    return content ? '\n\n---\n\n' + content + '\n' : match;
  });
}
