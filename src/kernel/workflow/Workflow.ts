import type { AgentSkillPackage } from '../skill/types.js';
import type { WorkflowPackageContext } from '../skill/types.js';
import type { SparrowWorkflowId } from './SparrowWorkflowId.js';

export interface Workflow {
  readonly id: SparrowWorkflowId;
  createAgentSkillPackage(ctx?: WorkflowPackageContext): AgentSkillPackage;
}
