import type { ContentStore } from '../content/ContentStore.js';
import { StandardAgentSkillPackage } from '../skill/StandardAgentSkillPackage.js';
import type { AgentSkillPackage, WorkflowPackageContext } from '../skill/types.js';
import type { SparrowWorkflowId } from './SparrowWorkflowId.js';
import type { Workflow } from './Workflow.js';

export abstract class ProcessWorkflow implements Workflow {
  constructor(
    readonly id: SparrowWorkflowId,
    protected readonly store: ContentStore,
  ) {}

  createAgentSkillPackage(ctx?: WorkflowPackageContext): AgentSkillPackage {
    this.assembleParts();
    return new StandardAgentSkillPackage(this.id, this.store, ctx);
  }

  /** Hook for workflow-specific part wiring (template method). */
  protected assembleParts(): void {
    /* default: schema-driven package */
  }
}
