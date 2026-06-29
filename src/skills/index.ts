/**
 * Skills registry — imports all skill templates to trigger registration.
 * Each skill module calls registerSkillTemplate() on import.
 */

import { register as registerExplore } from './explore.js';
import { register as registerArch } from './arch.js';
import { register as registerDesign } from './design.js';
import { register as registerModel } from './model.js';
import { register as registerPlan } from './plan.js';
import { register as registerApply } from './apply.js';

/**
 * Initialize all skill templates. Must be called before generating skill files.
 */
export function initializeSkills(): void {
  registerExplore();
  registerArch();
  registerDesign();
  registerModel();
  registerPlan();
  registerApply();
}
