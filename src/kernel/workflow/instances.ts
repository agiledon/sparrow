import type { ContentStore } from '../content/ContentStore.js';
import { SparrowWorkflowId } from './SparrowWorkflowId.js';
import { ProcessWorkflow } from './ProcessWorkflow.js';
import { SupportingWorkflow } from './SupportingWorkflow.js';

export class RequirementWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(SparrowWorkflowId.Requirement, store);
  }
}

export class ArchitectureWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(SparrowWorkflowId.Architecture, store);
  }
}

export class DesignWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(SparrowWorkflowId.Design, store);
  }
}

export class ModelWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(SparrowWorkflowId.Model, store);
  }
}

export class PlanWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(SparrowWorkflowId.Plan, store);
  }
}

export class ApplyWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(SparrowWorkflowId.Apply, store);
  }
}

export class VerifyWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(SparrowWorkflowId.Verify, store);
  }
}

export class ArchiveWorkflow extends ProcessWorkflow {
  constructor(store: ContentStore) {
    super(SparrowWorkflowId.Archive, store);
  }
}

export class SupportingHarnessWorkflow extends SupportingWorkflow {
  constructor(store: ContentStore) {
    super(SparrowWorkflowId.SupportingHarness, store);
  }
}

export class SupportingReconcileWorkflow extends SupportingWorkflow {
  constructor(store: ContentStore) {
    super(SparrowWorkflowId.SupportingReconcile, store);
  }
}
