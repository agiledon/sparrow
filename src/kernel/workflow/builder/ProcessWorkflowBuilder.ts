import type { ContentStore } from '../../content/ContentStore.js';
import { WorkflowBuilder } from './WorkflowBuilder.js';

export abstract class ProcessWorkflowBuilder extends WorkflowBuilder {
  constructor(protected readonly store: ContentStore) {
    super();
  }

  protected loadProcessDefinition(): void {
    /* shared hooks: schema already validated at store load */
  }

  build(): import('../Workflow.js').Workflow {
    this.loadProcessDefinition();
    return this.buildWorkflow();
  }
}
