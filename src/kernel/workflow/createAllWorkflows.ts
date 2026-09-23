import { getContentStore, type ContentStore } from '../content/ContentStore.js';
import { getSparrowSchema } from '../content/schema.js';
import { ProcessWorkflow } from './ProcessWorkflow.js';
import { SupportingWorkflow } from './SupportingWorkflow.js';
import type { WorkflowId } from './WorkflowId.js';
import type { Workflow } from './Workflow.js';

export function createAllWorkflows(store: ContentStore = getContentStore()): Workflow[] {
  return getSparrowSchema().workflows.map((entry) => {
    const id = entry.skillId as WorkflowId;
    if (entry.kind === 'supporting') {
      return new SupportingWorkflow(id, store);
    }
    return new ProcessWorkflow(id, store);
  });
}
