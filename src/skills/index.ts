import type { SkillRegistry } from '../core/skills.js';
import { getSkillPlugins } from '../plugins/index.js';
import { registerPluginSkillTemplates } from '../core/skill-generation.js';
import { loadBundledPlugins } from '../plugins/load.js';
import {
  composeSkillBodyFromWorkflow,
  workflowStepsToSkillSpecs,
} from '../core/workflow-schema/index.js';

export function initializeSkills(registry: SkillRegistry): void {
  loadBundledPlugins();

  const coreSkillSpecs = workflowStepsToSkillSpecs();
  for (const spec of coreSkillSpecs) {
    registry.registerTemplate(spec.id, () => composeSkillBodyFromWorkflow(spec.id));
    registry.registerHarness(spec.id, spec.harness);
  }
  registry.registerCoreSkills(coreSkillSpecs);

  const skillPlugins = getSkillPlugins();
  const pluginSkillDefs = skillPlugins.flatMap((p) =>
    (p.manifest.contributes.skills || []).map((s) => ({
      id: s.id,
      name: s.id,
      description: s.description,
      phase: s.phase,
      order: s.order,
      nextSkill: s.nextSkill,
      commandName: s.commandName,
      kind: s.kind ?? 'core',
      category: s.category,
    }))
  );
  registry.registerPluginSkills(pluginSkillDefs);
  registerPluginSkillTemplates(skillPlugins, registry);
}
