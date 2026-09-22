import type { Workflow } from '../Workflow.js';

export abstract class WorkflowBuilder {
  build(): Workflow {
    return this.buildWorkflow();
  }

  protected abstract buildWorkflow(): Workflow;
}
