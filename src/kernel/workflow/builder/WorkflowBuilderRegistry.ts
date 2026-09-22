import { getContentStore, type ContentStore } from '../../content/ContentStore.js';
import type { Workflow } from '../Workflow.js';
import { createDefaultWorkflowBuilders } from './instances.js';
import type { WorkflowBuilder } from './WorkflowBuilder.js';

export class WorkflowBuilderRegistry {
  private readonly builders: WorkflowBuilder[];

  constructor(store: ContentStore = getContentStore()) {
    this.builders = createDefaultWorkflowBuilders(store);
  }

  allBuilders(): readonly WorkflowBuilder[] {
    return this.builders;
  }

  buildAll(): Workflow[] {
    return this.builders.map((b) => b.build());
  }
}
