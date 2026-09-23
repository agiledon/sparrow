import type { ContentStore } from '../content/ContentStore.js';
import type {
  AgentSkillPackage,
  BundledFile,
  GeneratedSkillBundle,
  WorkflowPackageContext,
} from './types.js';

export class StandardAgentSkillPackage implements AgentSkillPackage {
  constructor(
    readonly workflowId: string,
    private readonly store: ContentStore,
    private readonly _ctx: WorkflowPackageContext = {},
  ) {
    void this._ctx;
  }

  generate(): GeneratedSkillBundle {
    const workflow = this.store.getWorkflow(this.workflowId);
    const packageCliLines =
      workflow.cliCommands?.map((c) => {
        const note = c.note ? ` (${c.note})` : '';
        return `包 CLI · ${c.id}：\`${c.usage}\`${note} — 勿用 skill/scripts 包装。`;
      }) ?? [];

    const references = this.collectReferences();
    const assets = this.collectAssets();
    const scripts = this.collectScripts();

    return {
      skillMarkdown: this.store.composeSkillMarkdown(this.workflowId),
      metadata: {
        id: workflow.skillId,
        name: workflow.name,
        description: workflow.description,
        category: workflow.category,
        tags: [
          'sparrow',
          'ddd',
          workflow.kind,
          workflow.phase === 'product' ? 'product-level' : 'team-level',
        ],
        ...(packageCliLines.length > 0 ? { packageCliLines } : {}),
        harnessRelPaths: this.store.resolveHarnessPaths(this.workflowId),
      },
      ...(references.length > 0 ? { references } : {}),
      ...(assets.length > 0 ? { assets } : {}),
      ...(scripts.length > 0 ? { scripts } : {}),
    };
  }

  private collectReferences(): BundledFile[] {
    const workflow = this.store.getWorkflow(this.workflowId);
    const out: BundledFile[] = [];

    for (const name of workflow.share ?? []) {
      const body = this.store.lookupSharedReference(name);
      if (body === undefined) {
        throw new Error(`Missing shared reference '${name}' for ${this.workflowId}`);
      }
      out.push({ relativePath: `references/${name}`, content: body });
    }

    for (const name of workflow.references ?? []) {
      const body = this.store.lookupWorkflowExtra(this.workflowId, `references/${name}`);
      if (body === undefined) {
        throw new Error(`Missing references/${name} for ${this.workflowId}`);
      }
      out.push({ relativePath: `references/${name}`, content: body });
    }

    return out;
  }

  private collectAssets(): BundledFile[] {
    const workflow = this.store.getWorkflow(this.workflowId);
    const out: BundledFile[] = [];

    for (const name of this.store.uniqueAssetNames(workflow)) {
      const body =
        this.store.lookupWorkflowExtra(this.workflowId, `assets/${name}`) ??
        this.store.lookupSharedAsset(name);
      if (body === undefined) {
        throw new Error(`Missing asset '${name}' for ${this.workflowId}`);
      }
      out.push({ relativePath: `assets/${name}`, content: body });
    }

    return out;
  }

  private collectScripts(): BundledFile[] {
    const workflow = this.store.getWorkflow(this.workflowId);
    const out: BundledFile[] = [];

    for (const name of workflow.scripts ?? []) {
      const body =
        this.store.lookupWorkflowExtra(this.workflowId, `scripts/${name}`) ??
        this.store.lookupSharedScript(name);
      if (body === undefined) {
        throw new Error(`Missing scripts/${name} for ${this.workflowId}`);
      }
      out.push({ relativePath: `scripts/${name}`, content: body });
    }

    return out;
  }
}
