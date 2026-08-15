/**
 * InitCommand — project initialization logic.
 *
 * Detects installed AI coding assistants, generates skill and command files
 * for each selected tool, and creates a sparrow.json project config.
 */

import { generateSkillFiles, generateProjectConfig, generateProjectMd, type ProjectContext } from './skill-generation.js';
import { initializeGlobalHarness, initializeProjectHarness } from './harness-init.js';
import { initializePluginRuntimes } from './plugin-init.js';
import { getSparrowVersion } from './package-version.js';
import { detectInstalledTools, parseToolSelection } from './tools.js';
import type { SkillRegistry } from './skills.js';

export interface InitOptions {
  /** Comma-separated tool ids or 'all' */
  tools?: string;
  /** Skip confirmation prompts */
  force?: boolean;
  /** Project name in English (used for code directory) */
  projectName: string;
}

export interface InitResult {
  tools: string[];
  projectName: string;
  createdFiles: { toolId: string; files: string[] }[];
  configPath: string;
  projectMdPath: string;
  /** Global harness files written during init */
  globalHarnessFiles: string[];
  /** Project harness files created during init */
  projectHarnessFiles: string[];
  /** Plugin runtime files installed during init */
  pluginRuntimeFiles: string[];
}

/**
 * Execute the init command.
 *
 * 1. Detect installed tools
 * 2. Resolve tool selection
 * 3. Initialize skill templates
 * 4. Generate skill/command files for each tool
 * 5. Create sparrow.json config
 */
export function executeInit(projectRoot: string, options: InitOptions, registry: SkillRegistry): InitResult {
  // Step 1: Detect tools
  const detectedTools = detectInstalledTools(projectRoot);

  // Step 2: Resolve tool selection
  const selectedToolIds = parseToolSelection(options.tools, detectedTools);

  if (selectedToolIds.length === 0) {
    throw new Error('No tools selected. Use --tools to specify which tools to set up.');
  }

  // Step 3: Generate skill and command files
  const createdFiles = generateSkillFiles(projectRoot, selectedToolIds, registry);

  // Step 4: Create project config
  const projectContext: ProjectContext = {
    projectRoot,
    projectName: options.projectName,
    version: getSparrowVersion(),
    toolIds: selectedToolIds,
  };
  const configPath = generateProjectConfig(projectContext);

  // Step 5: Create project.md wizard file
  const projectMdPath = generateProjectMd(projectContext);

  // Step 6: Initialize constraint assets (harness)
  // Global: DDD-universal discipline, written to the global config dir.
  // Project: placeholder files for project-specific constraints.
  const globalHarnessFiles = initializeGlobalHarness();
  const projectHarnessFiles = initializeProjectHarness(projectRoot);

  // Step 7: Install plugin runtimes (archify CLI etc.)
  const pluginRuntimeFiles = initializePluginRuntimes(projectRoot);

  return {
    tools: selectedToolIds,
    projectName: options.projectName,
    createdFiles,
    configPath,
    projectMdPath,
    globalHarnessFiles,
    projectHarnessFiles,
    pluginRuntimeFiles,
  };
}
