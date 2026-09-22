/** Stable workflow ids (match /sparrow-* command names). */
export enum SparrowWorkflowId {
  Requirement = 'sparrow-requirement',
  Arch = 'sparrow-arch',
  Design = 'sparrow-design',
  Model = 'sparrow-model',
  Plan = 'sparrow-plan',
  Apply = 'sparrow-apply',
  Verify = 'sparrow-verify',
  Archive = 'sparrow-archive',
  SupportingHarness = 'sparrow-supporting-harness',
  SupportingReconcile = 'sparrow-supporting-reconcile',
}

const PROCESS_ORDER: SparrowWorkflowId[] = [
  SparrowWorkflowId.Requirement,
  SparrowWorkflowId.Arch,
  SparrowWorkflowId.Design,
  SparrowWorkflowId.Model,
  SparrowWorkflowId.Plan,
  SparrowWorkflowId.Apply,
  SparrowWorkflowId.Verify,
  SparrowWorkflowId.Archive,
];

const SUPPORT_ORDER: SparrowWorkflowId[] = [
  SparrowWorkflowId.SupportingHarness,
  SparrowWorkflowId.SupportingReconcile,
];

export function allProcessWorkflowIds(): readonly SparrowWorkflowId[] {
  return PROCESS_ORDER;
}

export function allSupportWorkflowIds(): readonly SparrowWorkflowId[] {
  return SUPPORT_ORDER;
}

export function allWorkflowIds(): readonly SparrowWorkflowId[] {
  return [...PROCESS_ORDER, ...SUPPORT_ORDER];
}
