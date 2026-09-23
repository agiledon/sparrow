import type { SparrowSchema, WorkflowSchema } from './schema-types.js';
import {
  skillTemplates,
  sharedReferences,
  sharedAssets,
  sharedScripts,
  skillExtras,
} from '../../content/bundled-content.js';
import { getContentStore } from './ContentStore.js';
import {
  getSparrowSchema as getKernelSchema,
  resolveWorkflowHarnessPaths as resolveHarness,
  uniqueAssetNames as uniqueAssets,
} from './schema.js';
import type { SkillSpec } from '../skill/registry.js';

export function getSparrowSchema(): SparrowSchema {
  return getKernelSchema();
}

export function getWorkflowBySkillId(skillId: string): WorkflowSchema | undefined {
  return getSparrowSchema().workflows.find((w) => w.skillId === skillId);
}

export function getSkillTemplateBody(skillId: string): string {
  const workflow = getWorkflowBySkillId(skillId);
  if (!workflow) {
    throw new Error(`No workflow for skill: ${skillId}`);
  }
  const tpl = skillTemplates[workflow.template];
  if (tpl === undefined) {
    throw new Error(`Missing skill template: ${workflow.template}`);
  }
  return tpl;
}

export function composeSkillBodyFromWorkflow(skillId: string): string {
  return getContentStore().composeSkillMarkdown(skillId);
}

export function resolveWorkflowHarnessPaths(workflow: WorkflowSchema): string[] {
  return resolveHarness(workflow);
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

export function uniqueAssetNames(workflow: WorkflowSchema): string[] {
  return uniqueAssets(workflow);
}

export function workflowsToSkillSpecs(): SkillSpec[] {
  return getSparrowSchema().workflows.map((workflow) => ({
    id: workflow.skillId,
    name: workflow.name,
    description: workflow.description,
    phase: workflow.phase,
    order: workflow.order,
    nextSkill: workflow.nextSkill,
    commandName: workflow.skillId,
    kind: workflow.kind,
    category: workflow.category,
    harness: resolveWorkflowHarnessPaths(workflow),
    body: '',
  }));
}

export type {
  SparrowSchema,
  WorkflowSchema,
  CliCommand,
  ArtifactOutput,
  GlobalHarness,
  ConditionalHarnessEntry,
} from './schema-types.js';
