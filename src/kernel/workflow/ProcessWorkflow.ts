import type { ContentStore } from '../content/ContentStore.js';
import { StandardAgentSkillPackage } from '../skill/StandardAgentSkillPackage.js';
import type { AgentSkillPackage, WorkflowPackageContext } from '../skill/types.js';
import type { WorkflowId } from './WorkflowId.js';
import type { Workflow } from './Workflow.js';

/** Pipeline workflow; behavior is driven by Sparrow schema and content store. */
export class ProcessWorkflow implements Workflow {
  constructor(
    readonly id: WorkflowId,
    private readonly store: ContentStore,
  ) {}

  createAgentSkillPackage(ctx?: WorkflowPackageContext): AgentSkillPackage {
    return new StandardAgentSkillPackage(this.id, this.store, ctx);
  }
}
