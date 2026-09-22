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
    const step = this.store.getStep(this.workflowId);
    const packageCliLines =
      step.cliCommands?.map((c) => {
        const note = c.note ? ` (${c.note})` : '';
        return `包 CLI · ${c.id}：\`${c.usage}\`${note} — 勿用 skill/scripts 包装。`;
      }) ?? [];

    const references = this.collectReferences();
    const assets = this.collectAssets();
    const scripts = this.collectScripts();

    return {
      skillMarkdown: this.store.composeSkillMarkdown(this.workflowId),
      metadata: {
        id: step.skillId,
        name: step.name,
        description: step.description,
        category: step.category,
        tags: [
          'sparrow',
          'ddd',
          step.kind,
          step.phase === 'product' ? 'product-level' : 'team-level',
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
    const step = this.store.getStep(this.workflowId);
    const out: BundledFile[] = [];

    for (const name of step.share ?? []) {
      const body = this.store.lookupSharedReference(name);
      if (body === undefined) {
        throw new Error(`Missing shared reference '${name}' for ${this.workflowId}`);
      }
      out.push({ relativePath: `references/${name}`, content: body });
    }

    for (const name of step.references ?? []) {
      const body = this.store.lookupWorkflowExtra(this.workflowId, `references/${name}`);
      if (body === undefined) {
        throw new Error(`Missing references/${name} for ${this.workflowId}`);
      }
      out.push({ relativePath: `references/${name}`, content: body });
    }

    return out;
  }

  private collectAssets(): BundledFile[] {
    const step = this.store.getStep(this.workflowId);
    const out: BundledFile[] = [];

    for (const name of this.store.uniqueAssetNames(step)) {
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
    const step = this.store.getStep(this.workflowId);
    const out: BundledFile[] = [];

    for (const name of step.scripts ?? []) {
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
