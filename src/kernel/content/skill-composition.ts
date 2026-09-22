import type { SparrowWorkflowSchema, WorkflowStep } from './schema-types.js';
import {
  skillTemplates,
  sharedReferences,
  sharedAssets,
  sharedScripts,
  skillExtras,
} from '../../content/bundled-content.js';
import { getContentStore } from './ContentStore.js';
import {
  getWorkflowSchema as getKernelSchema,
  resolveStepHarnessPaths as resolveHarness,
  uniqueAssetNames as uniqueAssets,
} from './schema.js';
import type { SkillSpec } from '../skill/registry.js';

export function getWorkflowSchema(): SparrowWorkflowSchema {
  return getKernelSchema();
}

export function getWorkflowStepBySkillId(skillId: string): WorkflowStep | undefined {
  return getWorkflowSchema().steps.find((s) => s.skillId === skillId);
}

export function getSkillTemplateBody(skillId: string): string {
  const step = getWorkflowStepBySkillId(skillId);
  if (!step) {
    throw new Error(`No workflow step for skill: ${skillId}`);
  }
  const tpl = skillTemplates[step.template];
  if (tpl === undefined) {
    throw new Error(`Missing skill template: ${step.template}`);
  }
  return tpl;
}

export function composeSkillBodyFromWorkflow(skillId: string): string {
  return getContentStore().composeSkillMarkdown(skillId);
}

export function resolveStepHarnessPaths(step: WorkflowStep): string[] {
  return resolveHarness(step);
}

export function lookupSharedReference(name: string): string | undefined {
  return sharedReferences[name];
}

export function lookupSharedAsset(name: string): string | undefined {
  return sharedAssets[name];
}

export function lookupSharedScript(name: string): string | undefined {
  return sharedScripts[name];
}

export function lookupSkillExtra(skillId: string, relPath: string): string | undefined {
  return skillExtras[skillId]?.[relPath];
}

export function uniqueAssetNames(step: WorkflowStep): string[] {
  return uniqueAssets(step);
}

export function workflowStepsToSkillSpecs(): SkillSpec[] {
  return getWorkflowSchema().steps.map((step) => ({
    id: step.skillId,
    name: step.name,
    description: step.description,
    phase: step.phase,
    order: step.order,
    nextSkill: step.nextSkill,
    commandName: step.skillId,
    kind: step.kind,
    category: step.category,
    harness: resolveStepHarnessPaths(step),
    body: '',
  }));
}

export type {
  SparrowWorkflowSchema,
  WorkflowStep,
  ArtifactOutput,
  GlobalHarness,
  ConditionalHarnessEntry,
} from './schema-types.js';
