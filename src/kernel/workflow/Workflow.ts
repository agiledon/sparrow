import type { AgentSkillPackage } from '../skill/types.js';
import type { WorkflowPackageContext } from '../skill/types.js';
import type { WorkflowId } from './WorkflowId.js';

export interface Workflow {
  readonly id: WorkflowId;
  createAgentSkillPackage(ctx?: WorkflowPackageContext): AgentSkillPackage;
}
