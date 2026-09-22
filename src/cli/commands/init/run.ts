/**
 * InitCommand — project initialization logic.
 *
 * Detects installed AI coding assistants, generates skill and command files
 * for each selected tool, and creates sparrow-config.json / sparrow-state.json.
 */

import { join } from 'node:path';
import { generateSkillFiles, generateProjectConfig, type ProjectContext } from '../../agent-skill/generation.js';
import { initializeGlobalHarness, initializeProjectHarness } from '../../harness/install.js';
import { initializePluginRuntimes } from './plugin-init.js';
import { getSparrowVersion } from '../../shell/package-version.js';
import { detectInstalledTools, parseToolSelection } from '../../shell/tools.js';
import type { SkillRegistry } from '../../../kernel/skill/registry.js';
import { initializeSpecLayout } from '../../../kernel/runtime/spec-layout-init.js';
import { SPARROW_DOCS } from '../../../kernel/runtime/spec-paths.js';
import { ensureProjectState, resetProjectState, wipeSpecTrees } from '../../../kernel/runtime/project-state.js';
import { recordCliReadiness, type SparrowCliReadiness } from '../../shell/cli-readiness.js';

export interface InitOptions {
  /** Comma-separated tool ids or 'all' */
  tools?: string;
  /**
   * When true with wipeSpecs, reset sparrow-state.json and delete generated specs.
   * Confirmation is handled by the CLI, not this function.
   */
  force?: boolean;
  /** Delete master/change spec files and reset sparrow-state.json */
  wipeSpecs?: boolean;
  /** Project name in English (used for code directory) */
  projectName: string;
  /** BCP 47 language for document deliverables */
  lang: string;
}

export interface InitResult {
  tools: string[];
  projectName: string;
  createdFiles: { toolId: string; files: string[] }[];
  configPath: string;
  projectMdPath: string;
  statePath: string;
  stateCreated: boolean;
  specsWiped: boolean;
  /** Global harness files written during init */
  globalHarnessFiles: string[];
  /** Project harness files created during init */
  projectHarnessFiles: string[];
  /** Plugin runtime files installed during init */
  pluginRuntimeFiles: string[];
  /** Sparrow CLI probe written for agents (`.sparrow/cli-readiness.json`) */
  cliReadinessPath: string;
  cliReadiness: SparrowCliReadiness;
}

/**
 * Execute the init command.
 */
export function executeInit(projectRoot: string, options: InitOptions, registry: SkillRegistry): InitResult {
  const detectedTools = detectInstalledTools(projectRoot);
  const selectedToolIds = parseToolSelection(options.tools, detectedTools);

  if (selectedToolIds.length === 0) {
    throw new Error('No tools selected. Use --tools to specify which tools to set up.');
  }

  let specsWiped = false;
  if (options.wipeSpecs) {
    wipeSpecTrees(projectRoot);
    resetProjectState(projectRoot);
    specsWiped = true;
  }

  const createdFiles = generateSkillFiles(projectRoot, selectedToolIds, registry);

  const projectContext: ProjectContext = {
    projectRoot,
    projectName: options.projectName,
    version: getSparrowVersion(),
    toolIds: selectedToolIds,
    lang: options.lang,
  };
  const configPath = generateProjectConfig(projectContext);

  initializeSpecLayout(projectRoot);
  const { created: stateCreated, path: statePath } = ensureProjectState(projectRoot);
  const projectMdPath = join(projectRoot, SPARROW_DOCS, 'README.md');

  const globalHarnessFiles = initializeGlobalHarness();
  const projectHarnessFiles = initializeProjectHarness(projectRoot);
  const pluginRuntimeFiles = initializePluginRuntimes(projectRoot);

  const { path: cliReadinessPath, readiness: cliReadiness } = recordCliReadiness(projectRoot);

  return {
    tools: selectedToolIds,
    projectName: options.projectName,
    createdFiles,
    configPath,
    projectMdPath,
    statePath,
    stateCreated,
    specsWiped,
    globalHarnessFiles,
    projectHarnessFiles,
    pluginRuntimeFiles,
    cliReadinessPath,
    cliReadiness,
  };
}
