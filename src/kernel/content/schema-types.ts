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
  /** Shared reference files copied into this skill's references/ */
  share?: string[];
  /** Skill-specific files under templates/skills/<id>/references/ */
  references?: string[];
  /** Output templates under templates/skills/<id>/assets/ or shared/assets/ */
  assets?: string[];
  /** Mechanical scripts under templates/skills/<id>/scripts/ */
  scripts?: string[];
  /** Sparrow package CLI (not copied into skill scripts/) */
  cliCommands?: StepCliCommand[];
  /** Output templates and the workspace-relative dest they fill. */
  outputs?: ArtifactOutput[];
}

export interface StepCliCommand {
  /** CLI capability id, e.g. ingest */
  id: string;
  /** Example invocation from project root */
  usage: string;
  note?: string;
}

export interface ArtifactOutput {
  /** Filename in assets/ (skill dir or shared/assets) */
  asset: string;
  /**
   * Destination relative to `docs/sparrow/change/current/{activeChangeId}/`,
   * unless it starts with `docs/sparrow/master/`.
   */
  dest: string;
  /** True for UI / interaction-context / topology-only artifacts. */
  optional?: boolean;
}

export interface SparrowWorkflowSchema {
  name: string;
  version: number;
  description: string;
  coreStepCount: number;
  globalHarness: GlobalHarness;
  steps: WorkflowStep[];
}
