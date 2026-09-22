import type { SparrowWorkflowSchema, WorkflowStep } from './types.js';
import { validateWorkflowSchema } from './validate.js';
import schemaJson from '../../schemas/schema.json';
import {
  skillTemplates,
  workflowBlocks,
  sharedReferences,
  sharedAssets,
  sharedScripts,
  skillExtras,
} from '../../schemas/bundled-content.js';
import { HARNESS_TOKEN } from '../skill-tokens.js';

let cached: SparrowWorkflowSchema | null = null;

function renderCliCommandsBlock(step: WorkflowStep): string {
  if (!step.cliCommands?.length) {
    return '';
  }
  const lines = [
    '## 包 CLI（非 skill/scripts）',
    '',
    '以下由 **Sparrow CLI** 在项目根提供；`scripts/` 仅含 state / ensure 等机械脚本，**不要**为 ingest 增加 skill 包装。',
    '',
  ];
  for (const cmd of step.cliCommands) {
    const note = cmd.note ? ` — ${cmd.note}` : '';
    lines.push(`- **${cmd.id}**：\`${cmd.usage}\`${note}`);
  }
  return lines.join('\n');
}

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
  const parts: string[] = [];
  if (step.workflowBlock) {
    const block = workflowBlocks[step.workflowBlock];
    if (block) {
      parts.push(block.replaceAll(HARNESS_TOKEN, '').trim());
    }
  }
  const cliBlock = renderCliCommandsBlock(step);
  if (cliBlock) {
    parts.push(cliBlock);
  }
  parts.push(getSkillTemplateBody(skillId).trim());
  let body = parts.join('\n\n');
  if (!body.includes(HARNESS_TOKEN)) {
    body = `${body}\n\n${HARNESS_TOKEN}\n`;
  }
  return body;
}

export function resolveStepHarnessPaths(step: WorkflowStep): string[] {
  const { globalHarness } = getWorkflowSchema();
  const always = globalHarness?.always ?? [];
  return [...always, ...step.harness];
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
  const names = (step.outputs ?? []).map((o) => o.asset);
  if (names.length === 0) {
    return [...(step.assets ?? [])];
  }
  return [...new Set(names)];
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

export type { SparrowWorkflowSchema, WorkflowStep, ArtifactOutput, GlobalHarness, ConditionalHarnessEntry } from './types.js';
