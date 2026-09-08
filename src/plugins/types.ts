export interface ContributedSkill {
  id: string;
  commandName: string;
  phase: 'product' | 'team';
  order: number;
  category: string;
  description: string;
  nextSkill: string | null;
  kind?: 'core' | 'supporting';
}

export interface ContributedAugment {
  targetSkill: string;
  contentFile?: string;
}

export interface ContributedToolAdapter {
  id: string;
  name: string;
  skillsDir: string;
  commandsDir: string;
  format: 'claude-style' | 'opencode-style' | 'cursor-style';
  detectionPaths: string[];
}

export interface ContributedCodeGenerator {
  language: string;
  framework: string;
  contentFile: string;
}

export interface ContributedHarness {
  stageId: string;
  file: string;
  contentFile: string;
}

export interface PluginRuntime {
  bin?: string;
  resources?: string[];
}

export interface PluginContributes {
  skills?: ContributedSkill[];
  augments?: ContributedAugment[];
  toolAdapters?: ContributedToolAdapter[];
  codeGenerators?: ContributedCodeGenerator[];
  harness?: ContributedHarness[];
  runtime?: PluginRuntime;
}

export interface PluginManifest {
  name: string;
  displayName: string;
  version: string;
  description: string;
  engines: { sparrow: string };
  contributes: PluginContributes;
}

export interface Plugin {
  manifest: PluginManifest;
  skillContent: string;
  augmentContents: Record<string, string>;
  runtimeSourcePath?: string;
}

export interface PluginEntry {
  name: string;
  version: string;
  installedAt: string;
  enabled: boolean;
}
