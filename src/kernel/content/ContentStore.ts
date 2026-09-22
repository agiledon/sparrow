import type { SparrowWorkflowSchema, WorkflowStep } from './schema-types.js';
import { getWorkflowSchema } from './schema.js';
import {
  skillTemplates,
  workflowBlocks,
  sharedReferences,
  sharedAssets,
  sharedScripts,
  skillExtras,
} from '../../content/bundled-content.js';
import { HARNESS_TOKEN } from '../skill/HarnessToken.js';

export class ContentStore {
  getSchema(): SparrowWorkflowSchema {
    return getWorkflowSchema();
  }

  getStep(workflowId: string): WorkflowStep {
    const step = getWorkflowSchema().steps.find((s) => s.skillId === workflowId);
    if (!step) {
      throw new Error(`No workflow step for id: ${workflowId}`);
    }
    return step;
  }

  getGuidelineBody(workflowBlock: string | null): string | undefined {
    if (!workflowBlock) return undefined;
    const block = workflowBlocks[workflowBlock];
    if (!block) return undefined;
    return block.replaceAll(HARNESS_TOKEN, '').trim();
  }

  getActivityBody(workflowId: string): string {
    const step = this.getStep(workflowId);
    const tpl = skillTemplates[step.template];
    if (tpl === undefined) {
      throw new Error(`Missing skill template: ${step.template}`);
    }
    return tpl.trim();
  }

  renderCliCommandsBlock(step: WorkflowStep): string {
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

  composeSkillMarkdown(workflowId: string): string {
    const step = this.getStep(workflowId);
    const parts: string[] = [];
    const guideline = this.getGuidelineBody(step.workflowBlock);
    if (guideline) {
      parts.push(guideline);
    }
    const cliBlock = this.renderCliCommandsBlock(step);
    if (cliBlock) {
      parts.push(cliBlock);
    }
    parts.push(this.getActivityBody(workflowId));
    let body = parts.join('\n\n');
    if (!body.includes(HARNESS_TOKEN)) {
      body = `${body}\n\n${HARNESS_TOKEN}\n`;
    }
    return body;
  }

  resolveHarnessPaths(workflowId: string): string[] {
    const step = this.getStep(workflowId);
    const { globalHarness } = getWorkflowSchema();
    const always = globalHarness?.always ?? [];
    return [...always, ...step.harness];
  }

  lookupSharedReference(name: string): string | undefined {
    return sharedReferences[name];
  }

  lookupSharedAsset(name: string): string | undefined {
    return sharedAssets[name];
  }

  lookupSharedScript(name: string): string | undefined {
    return sharedScripts[name];
  }

  lookupWorkflowExtra(workflowId: string, relPath: string): string | undefined {
    return skillExtras[workflowId]?.[relPath];
  }

  uniqueAssetNames(step: WorkflowStep): string[] {
    const names = (step.outputs ?? []).map((o) => o.asset);
    if (names.length === 0) {
      return [...(step.assets ?? [])];
    }
    return [...new Set(names)];
  }
}

let defaultStore: ContentStore | null = null;

export function getContentStore(): ContentStore {
  if (!defaultStore) {
    defaultStore = new ContentStore();
  }
  return defaultStore;
}

export { skillTemplates, skillExtras, sharedReferences, sharedAssets, sharedScripts };
