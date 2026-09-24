import type { SparrowSchema, WorkflowSchema } from './schema-types.js';
import { getSparrowSchema } from './schema.js';
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
  getSchema(): SparrowSchema {
    return getSparrowSchema();
  }

  getWorkflow(workflowId: string): WorkflowSchema {
    const workflow = getSparrowSchema().workflows.find((w) => w.skillId === workflowId);
    if (!workflow) {
      throw new Error(`No workflow for id: ${workflowId}`);
    }
    return workflow;
  }

  getGuidelineBody(workflowBlock: string | null): string | undefined {
    if (!workflowBlock) return undefined;
    const block = workflowBlocks[workflowBlock];
    if (!block) return undefined;
    return block.replaceAll(HARNESS_TOKEN, '').trim();
  }

  getActivityBody(workflowId: string): string {
    const workflow = this.getWorkflow(workflowId);
    const tpl = skillTemplates[workflow.template];
    if (tpl === undefined) {
      throw new Error(`Missing skill template: ${workflow.template}`);
    }
    return tpl.trim();
  }

  getCheckpointBody(workflowId: string): string | undefined {
    const body = skillExtras[workflowId]?.['checkpoint.md'];
    if (!body) return undefined;
    return body.trim();
  }

  renderCliCommandsBlock(workflow: WorkflowSchema): string {
    if (!workflow.cliCommands?.length) {
      return '';
    }
    const lines = [
      '## 包 CLI（非 skill/scripts）',
      '',
      '以下由 **Sparrow CLI** 在项目根提供；`scripts/` 仅含 state / ensure 等机械脚本，**不要**为 ingest 增加 skill 包装。',
      '',
    ];
    for (const cmd of workflow.cliCommands) {
      const note = cmd.note ? ` — ${cmd.note}` : '';
      lines.push(`- **${cmd.id}**：\`${cmd.usage}\`${note}`);
    }
    return lines.join('\n');
  }

  composeSkillMarkdown(workflowId: string): string {
    const workflow = this.getWorkflow(workflowId);
    const parts: string[] = [];
    const guideline = this.getGuidelineBody(workflow.workflowBlock);
    if (guideline) {
      parts.push(guideline);
    }
    const cliBlock = this.renderCliCommandsBlock(workflow);
    if (cliBlock) {
      parts.push(cliBlock);
    }
    parts.push(this.getActivityBody(workflowId));
    const checkpoint = this.getCheckpointBody(workflowId);
    if (checkpoint) {
      parts.push(checkpoint);
    }
    let body = parts.join('\n\n');
    if (!body.includes(HARNESS_TOKEN)) {
      body = `${body}\n\n${HARNESS_TOKEN}\n`;
    }
    return body;
  }

  resolveHarnessPaths(workflowId: string): string[] {
    const workflow = this.getWorkflow(workflowId);
    const { globalHarness } = getSparrowSchema();
    const always = globalHarness?.always ?? [];
    return [...always, ...workflow.harness];
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

  listWorkflowExtras(workflowId: string, prefix: string): { relPath: string; content: string }[] {
    const extras = skillExtras[workflowId] ?? {};
    return Object.entries(extras)
      .filter(([relPath]) => relPath.startsWith(prefix))
      .map(([relPath, content]) => ({ relPath, content }));
  }

  uniqueAssetNames(workflow: WorkflowSchema): string[] {
    const names = (workflow.outputs ?? []).map((o) => o.asset);
    if (names.length === 0) {
      return [...(workflow.assets ?? [])];
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
