import type { SparrowWorkflowSchema, WorkflowStep } from './types.js';
import { validateWorkflowSchema } from './validate.js';
import schemaJson from '../../schemas/sparrow-ddd/schema.json';
import {
  skillTemplates,
  workflowBlocks,
  specLayoutGuide,
} from '../../schemas/sparrow-ddd/bundled-content.js';

let cached: SparrowWorkflowSchema | null = null;

export function getWorkflowSchema(): SparrowWorkflowSchema {
  if (!cached) {
    cached = schemaJson as SparrowWorkflowSchema;
    validateWorkflowSchema(cached);
  }
  return cached;
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
  const step = getWorkflowStepBySkillId(skillId);
  if (!step) {
    throw new Error(`No workflow step for skill: ${skillId}`);
  }
  const parts: string[] = [specLayoutGuide];
  if (step.workflowBlock) {
    const block = workflowBlocks[step.workflowBlock];
    if (block) {
      parts.push(block);
    }
  }
  parts.push(getSkillTemplateBody(skillId));
  return parts.join('\n\n');
}

export function resolveStepHarnessPaths(step: WorkflowStep): string[] {
  const { globalHarness } = getWorkflowSchema();
  const always = globalHarness?.always ?? [];
  return [...always, ...step.harness];
}

export function workflowStepsToSkillSpecs(): import('../skills.js').SkillSpec[] {
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

export type { SparrowWorkflowSchema, WorkflowStep, GlobalHarness, ConditionalHarnessEntry } from './types.js';
