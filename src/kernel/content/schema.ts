import type { SparrowWorkflowSchema } from './schema-types.js';
import { validateWorkflowSchema } from '../../core/workflow-schema/validate.js';
import schemaJson from '../../content/schema/schema.json';

let cached: SparrowWorkflowSchema | null = null;

export function getWorkflowSchema(): SparrowWorkflowSchema {
  if (!cached) {
    cached = schemaJson as SparrowWorkflowSchema;
    validateWorkflowSchema(cached);
  }
  return cached;
}

export function getWorkflowStepBySkillId(skillId: string) {
  return getWorkflowSchema().steps.find((s) => s.skillId === skillId);
}

export function resolveStepHarnessPaths(step: import('./schema-types.js').WorkflowStep): string[] {
  const { globalHarness } = getWorkflowSchema();
  const always = globalHarness?.always ?? [];
  return [...always, ...step.harness];
}

export function uniqueAssetNames(step: import('./schema-types.js').WorkflowStep): string[] {
  const names = (step.outputs ?? []).map((o) => o.asset);
  if (names.length === 0) {
    return [...(step.assets ?? [])];
  }
  return [...new Set(names)];
}
