import type { ContentStore } from '../content/ContentStore.js';
import { WorkflowId } from './WorkflowId.js';
import { ProcessWorkflow } from './ProcessWorkflow.js';
import { SupportingWorkflow } from './SupportingWorkflow.js';

export class RequirementWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(WorkflowId.Requirement, store);
  }
}

export class ArchitectureWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(WorkflowId.Architecture, store);
  }
}

export class DesignWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(WorkflowId.Design, store);
  }
}

export class ModelWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(WorkflowId.Model, store);
  }
}

export class PlanWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(WorkflowId.Plan, store);
  }
}

export class ApplyWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(WorkflowId.Apply, store);
  }
}

export class VerifyWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(WorkflowId.Verify, store);
  }
}

export class ArchiveWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(WorkflowId.Archive, store);
  }
}

export class SupportingHarnessWorkflow extends SupportingWorkflow {
  constructor(store: ContentStore) {
    super(WorkflowId.SupportingHarness, store);
  }
}

export class SupportingReconcileWorkflow extends SupportingWorkflow {
  constructor(store: ContentStore) {
    super(WorkflowId.SupportingReconcile, store);
  }
}
