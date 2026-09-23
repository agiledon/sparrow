import type { ContentStore } from '../content/ContentStore.js';
import { StandardAgentSkillPackage } from '../skill/StandardAgentSkillPackage.js';
import type { AgentSkillPackage, WorkflowPackageContext } from '../skill/types.js';
import type { WorkflowId } from './WorkflowId.js';
import type { Workflow } from './Workflow.js';

export abstract class SupportingWorkflow implements Workflow {
  constructor(
    readonly id: WorkflowId,
    protected readonly store: ContentStore,
  ) {}

  createAgentSkillPackage(ctx?: WorkflowPackageContext): AgentSkillPackage {
    this.assembleParts();
    return new StandardAgentSkillPackage(this.id, this.store, ctx);
  }

  protected assembleParts(): void {
    /* default: schema-driven package */
  }
}
