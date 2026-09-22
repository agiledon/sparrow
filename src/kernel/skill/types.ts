export interface BundledFile {
  /** Path relative to skill directory (e.g. references/foo.md) */
  relativePath: string;
  content: string;
}

export interface AgentSkillMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  packageCliLines?: string[];
  harnessRelPaths: string[];
}

export interface GeneratedSkillBundle {
  skillMarkdown: string;
  metadata: AgentSkillMetadata;
  references?: BundledFile[];
  assets?: BundledFile[];
  scripts?: BundledFile[];
}

export interface WorkflowPackageContext {
  /** Reserved for plugin / project context */
}

export interface AgentSkillPackage {
  readonly workflowId: string;
  generate(): GeneratedSkillBundle;
}
