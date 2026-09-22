import type { SparrowWorkflowSchema } from './schema-types.js';

export function validateWorkflowSchema(schema: SparrowWorkflowSchema): void {
  if (!schema.globalHarness?.always?.length) {
    throw new Error('globalHarness.always must include at least one path (typically constitution.md)');
  }
  for (const entry of schema.globalHarness?.conditional ?? []) {
    if (!entry.path || !entry.when) {
      throw new Error('globalHarness.conditional entries require path and when');
    }
  }
  const ids = new Set(schema.steps.map((s) => s.id));
  for (const step of schema.steps) {
    for (const req of step.requires) {
      if (!ids.has(req)) {
        throw new Error(`Step ${step.id} requires unknown step: ${req}`);
      }
    }
    for (const output of step.outputs ?? []) {
      if (!output.asset || !output.dest) {
        throw new Error(`Step ${step.id} outputs require asset and dest`);
      }
    }
    for (const cli of step.cliCommands ?? []) {
      if (!cli.id || !cli.usage) {
        throw new Error(`Step ${step.id} cliCommands entries require id and usage`);
      }
    }
  }
  const core = schema.steps.filter((s) => s.kind === 'core' && s.order <= schema.coreStepCount);
  const orders = new Set(core.map((s) => s.order));
  for (let i = 1; i <= schema.coreStepCount; i++) {
    if (!orders.has(i)) {
      throw new Error(`Missing core step with order ${i}`);
    }
  }
}
