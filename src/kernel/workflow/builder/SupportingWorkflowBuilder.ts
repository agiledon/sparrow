import type { ContentStore } from '../../content/ContentStore.js';
import { WorkflowBuilder } from './WorkflowBuilder.js';

export abstract class SupportingWorkflowBuilder extends WorkflowBuilder {
  constructor(protected readonly store: ContentStore) {
    super();
  }

  protected loadSupportDefinition(): void {
    /* shared hooks for supporting workflows */
  }

  build(): import('../Workflow.js').Workflow {
    this.loadSupportDefinition();
    return this.buildWorkflow();
  }
}
