import type { SparrowWorkflowSchema } from './types.js';

export function validateWorkflowSchema(schema: SparrowWorkflowSchema): void {
  const ids = new Set(schema.steps.map((s) => s.id));
  for (const step of schema.steps) {
    for (const req of step.requires) {
      if (!ids.has(req)) {
        throw new Error(`Step ${step.id} requires unknown step: ${req}`);
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
