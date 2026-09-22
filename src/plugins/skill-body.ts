import type { Plugin, ContributedSkill } from './types.js';

export function buildPluginSkillBody(skill: ContributedSkill, plugin: Plugin): string {
  return [
    `# ${skill.commandName}`,
    '',
    `${skill.description}`,
    '',
    `> 本技能是 Sparrow 框架的扩展技能（插件：${plugin.manifest.displayName} v${plugin.manifest.version}）。`,
    '',
    '---',
    '',
    plugin.skillContent,
  ].join('\n');
}
