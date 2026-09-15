export interface ConditionalHarnessEntry {
  path: string;
  when: string;
}

export interface GlobalHarness {
  always: string[];
  conditional: ConditionalHarnessEntry[];
}

export interface WorkflowStep {
  id: string;
  skillId: string;
  name: string;
  description: string;
  phase: 'product' | 'team';
  order: number;
  nextSkill: string | null;
  kind: 'core' | 'supporting';
  category: string;
  template: string;
  workflowBlock: string | null;
  harness: string[];
  requires: string[];
  scope?: 'slug';
}

export interface SparrowWorkflowSchema {
  name: string;
  version: number;
  description: string;
  coreStepCount: number;
  globalHarness: GlobalHarness;
  steps: WorkflowStep[];
}
