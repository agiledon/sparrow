import type { SparrowSchema, WorkflowSchema } from './schema-types.js';
import { validateSparrowSchema } from './validate-sparrow-schema.js';
import schemaJson from '../../content/schema/schema.json';

let cached: SparrowSchema | null = null;

export function getSparrowSchema(): SparrowSchema {
  if (!cached) {
    cached = schemaJson as SparrowSchema;
    validateSparrowSchema(cached);
  }
  return cached;
}

export function getWorkflowBySkillId(skillId: string) {
  return getSparrowSchema().workflows.find((w) => w.skillId === skillId);
}

export function resolveWorkflowHarnessPaths(workflow: WorkflowSchema): string[] {
  const { globalHarness } = getSparrowSchema();
  const always = globalHarness?.always ?? [];
  return [...always, ...workflow.harness];
}

export function uniqueAssetNames(workflow: WorkflowSchema): string[] {
  const names = (workflow.outputs ?? []).map((o) => o.asset);
  if (names.length === 0) {
    return [...(workflow.assets ?? [])];
  }
  return [...new Set(names)];
}
