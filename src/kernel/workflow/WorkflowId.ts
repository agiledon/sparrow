/** Stable workflow ids (match /sparrow-* command names). */
export enum WorkflowId {
  Requirement = 'sparrow-requirement',
  Architecture = 'sparrow-architecture',
  Design = 'sparrow-design',
  Model = 'sparrow-model',
  Plan = 'sparrow-plan',
  Apply = 'sparrow-apply',
  Verify = 'sparrow-verify',
  Archive = 'sparrow-archive',
  SupportingHarness = 'sparrow-supporting-harness',
  SupportingReconcile = 'sparrow-supporting-reconcile',
}

const PROCESS_ORDER: WorkflowId[] = [
  WorkflowId.Requirement,
  WorkflowId.Architecture,
  WorkflowId.Design,
  WorkflowId.Model,
  WorkflowId.Plan,
  WorkflowId.Apply,
  WorkflowId.Verify,
  WorkflowId.Archive,
];

const SUPPORT_ORDER: WorkflowId[] = [
  WorkflowId.SupportingHarness,
  WorkflowId.SupportingReconcile,
];

export function allProcessWorkflowIds(): readonly WorkflowId[] {
  return PROCESS_ORDER;
}

export function allSupportWorkflowIds(): readonly WorkflowId[] {
  return SUPPORT_ORDER;
}

export function allWorkflowIds(): readonly WorkflowId[] {
  return [...PROCESS_ORDER, ...SUPPORT_ORDER];
}
