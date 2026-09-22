import type { ContentStore } from '../../content/ContentStore.js';
import type { WorkflowBuilder } from './WorkflowBuilder.js';
import {
  ApplyWorkflow,
  ArchWorkflow,
  ArchiveWorkflow,
  DesignWorkflow,
  ModelWorkflow,
  PlanWorkflow,
  RequirementWorkflow,
  SupportingHarnessWorkflow,
  SupportingReconcileWorkflow,
  VerifyWorkflow,
} from '../instances.js';
import type { Workflow } from '../Workflow.js';
import { ProcessWorkflowBuilder } from './ProcessWorkflowBuilder.js';
import { SupportingWorkflowBuilder } from './SupportingWorkflowBuilder.js';

export class RequirementWorkflowBuilder extends ProcessWorkflowBuilder {
  protected buildWorkflow(): Workflow {
    return new RequirementWorkflow(this.store);
  }
}

export class ArchWorkflowBuilder extends ProcessWorkflowBuilder {
  protected buildWorkflow(): Workflow {
    return new ArchWorkflow(this.store);
  }
}

export class DesignWorkflowBuilder extends ProcessWorkflowBuilder {
  protected buildWorkflow(): Workflow {
    return new DesignWorkflow(this.store);
  }
}

export class ModelWorkflowBuilder extends ProcessWorkflowBuilder {
  protected buildWorkflow(): Workflow {
    return new ModelWorkflow(this.store);
  }
}

export class PlanWorkflowBuilder extends ProcessWorkflowBuilder {
  protected buildWorkflow(): Workflow {
    return new PlanWorkflow(this.store);
  }
}

export class ApplyWorkflowBuilder extends ProcessWorkflowBuilder {
  protected buildWorkflow(): Workflow {
    return new ApplyWorkflow(this.store);
  }
}

export class VerifyWorkflowBuilder extends ProcessWorkflowBuilder {
  protected buildWorkflow(): Workflow {
    return new VerifyWorkflow(this.store);
  }
}

export class ArchiveWorkflowBuilder extends ProcessWorkflowBuilder {
  protected buildWorkflow(): Workflow {
    return new ArchiveWorkflow(this.store);
  }
}

export class SupportingHarnessWorkflowBuilder extends SupportingWorkflowBuilder {
  protected buildWorkflow(): Workflow {
    return new SupportingHarnessWorkflow(this.store);
  }
}

export class SupportingReconcileWorkflowBuilder extends SupportingWorkflowBuilder {
  protected buildWorkflow(): Workflow {
    return new SupportingReconcileWorkflow(this.store);
  }
}

export function createDefaultWorkflowBuilders(store: ContentStore): WorkflowBuilder[] {
  return [
    new RequirementWorkflowBuilder(store),
    new ArchWorkflowBuilder(store),
    new DesignWorkflowBuilder(store),
    new ModelWorkflowBuilder(store),
    new PlanWorkflowBuilder(store),
    new ApplyWorkflowBuilder(store),
    new VerifyWorkflowBuilder(store),
    new ArchiveWorkflowBuilder(store),
    new SupportingHarnessWorkflowBuilder(store),
    new SupportingReconcileWorkflowBuilder(store),
  ];
}
