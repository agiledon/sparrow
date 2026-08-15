import { spec as exploreSpec } from './explore.js';
import { spec as archSpec } from './arch.js';
import { spec as designSpec } from './design.js';
import { spec as modelSpec } from './model.js';
import { spec as planSpec } from './plan.js';
import { spec as applySpec } from './apply.js';
import { spec as archiveSpec } from './archive.js';
import { spec as harnessSpec } from './harness.js';
import { registerPluginSkills, registerCoreSkills } from '../core/skills.js';
import { getSkillPlugins } from '../plugins/index.js';
import { registerPluginSkillTemplates, registerSkillTemplate, registerSkillHarness } from '../core/skill-generation.js';
import { loadBundledPlugins } from '../plugins/load.js';

const CORE_SKILL_SPECS = [
  harnessSpec,
  exploreSpec,
  archSpec,
  designSpec,
  modelSpec,
  planSpec,
  applySpec,
  archiveSpec,
];

export function initializeSkills(): void {
  loadBundledPlugins();

  for (const spec of CORE_SKILL_SPECS) {
    registerSkillTemplate(spec.id, () => spec.body);
    registerSkillHarness(spec.id, spec.harness);
  }
  registerCoreSkills(CORE_SKILL_SPECS);

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
      category: s.category,
    }))
  );
  registerPluginSkills(pluginSkillDefs);
  registerPluginSkillTemplates(skillPlugins);
}
