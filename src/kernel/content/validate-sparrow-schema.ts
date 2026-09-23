import type { SparrowSchema } from './schema-types.js';

export function validateSparrowSchema(schema: SparrowSchema): void {
  if (!schema.globalHarness?.always?.length) {
    throw new Error('globalHarness.always must include at least one path (typically constitution.md)');
  }
  for (const entry of schema.globalHarness?.conditional ?? []) {
    if (!entry.path || !entry.when) {
      throw new Error('globalHarness.conditional entries require path and when');
    }
  }
  const ids = new Set(schema.workflows.map((w) => w.id));
  for (const workflow of schema.workflows) {
    for (const req of workflow.requires) {
      if (!ids.has(req)) {
        throw new Error(`Workflow ${workflow.id} requires unknown workflow: ${req}`);
      }
    }
    for (const output of workflow.outputs ?? []) {
      if (!output.asset || !output.dest) {
        throw new Error(`Workflow ${workflow.id} outputs require asset and dest`);
      }
    }
    for (const cli of workflow.cliCommands ?? []) {
      if (!cli.id || !cli.usage) {
        throw new Error(`Workflow ${workflow.id} cliCommands entries require id and usage`);
      }
    }
  }
  const processWorkflows = schema.workflows.filter(
    (w) => w.kind === 'process' && w.order <= schema.processWorkflowCount,
  );
  const orders = new Set(processWorkflows.map((w) => w.order));
  for (let i = 1; i <= schema.processWorkflowCount; i++) {
    if (!orders.has(i)) {
      throw new Error(`Missing process workflow with order ${i}`);
    }
  }
}
