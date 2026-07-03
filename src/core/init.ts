/**
 * InitCommand — project initialization logic.
 *
 * Detects installed AI coding assistants, generates skill and command files
 * for each selected tool, and creates a sparrow.json project config.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { SUPPORTED_TOOLS, type ToolDefinition } from './config.js';
import { generateSkillFiles, generateProjectConfig, generateProjectMd } from './skill-generation.js';
import { initializeSkills } from '../skills/index.js';

const SPARROW_VERSION = '0.1.1';

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
}

/**
 * Detect which AI tools are installed in the project directory.
 * Checks for the presence of each tool's detection paths.
 */
export function detectInstalledTools(projectRoot: string): ToolDefinition[] {
  return SUPPORTED_TOOLS.filter((tool) => {
    return tool.detectionPaths.some((p) => {
      const fullPath = join(projectRoot, p);
      return existsSync(fullPath);
    });
  });
}

/**
 * Parse the --tools flag into a list of tool ids.
 * Returns 'all' tools if 'all' is specified.
 */
export function parseToolSelection(
  toolsFlag: string | undefined,
  detectedTools: ToolDefinition[]
): string[] {
  if (!toolsFlag) {
    // No flag: use detected tools, or default to all if none detected
    if (detectedTools.length > 0) {
      return detectedTools.map((t) => t.id);
    }
    return SUPPORTED_TOOLS.map((t) => t.id);
  }

  const selections = toolsFlag.toLowerCase().split(',').map((s) => s.trim());

  if (selections.includes('all')) {
    return SUPPORTED_TOOLS.map((t) => t.id);
  }

  // Validate each selection
  const validIds = new Set(SUPPORTED_TOOLS.map((t) => t.id));
  const invalid = selections.filter((s) => !validIds.has(s));
  if (invalid.length > 0) {
    throw new Error(
      `Unknown tool(s): ${invalid.join(', ')}. Supported tools: ${Array.from(validIds).join(', ')}`
    );
  }

  return selections;
}

/**
 * Generate a summary table of detected tools for display.
 */
export function formatToolDetectionSummary(detectedTools: ToolDefinition[]): string {
  if (detectedTools.length === 0) {
    return 'No AI coding tools detected in this project.';
  }

  const lines = ['Detected AI coding tools:'];
  for (const tool of detectedTools) {
    lines.push(`  ✅ ${tool.name} (${tool.id})`);
  }

  const undetected = SUPPORTED_TOOLS.filter(
    (t) => !detectedTools.some((d) => d.id === t.id)
  );
  if (undetected.length > 0) {
    lines.push('');
    lines.push('Not detected (can still be selected with --tools):');
    for (const tool of undetected) {
      lines.push(`  ⬜ ${tool.name} (${tool.id})`);
    }
  }

  return lines.join('\n');
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
export function executeInit(projectRoot: string, options: InitOptions): InitResult {
  // Step 1: Detect tools
  const detectedTools = detectInstalledTools(projectRoot);

  // Step 2: Resolve tool selection
  const selectedToolIds = parseToolSelection(options.tools, detectedTools);

  if (selectedToolIds.length === 0) {
    throw new Error('No tools selected. Use --tools to specify which tools to set up.');
  }

  // Step 3: Initialize skill templates (triggers all registrations)
  initializeSkills();

  // Step 4: Generate skill and command files
  const createdFiles = generateSkillFiles(projectRoot, selectedToolIds);

  // Step 5: Create project config
  const configPath = generateProjectConfig(projectRoot, selectedToolIds, SPARROW_VERSION, options.projectName);

  // Step 6: Create project.md wizard file
  const projectMdPath = generateProjectMd(projectRoot, options.projectName, SPARROW_VERSION, selectedToolIds);

  return {
    tools: selectedToolIds,
    projectName: options.projectName,
    createdFiles,
    configPath,
    projectMdPath,
  };
}

/**
 * Format the init result as a user-friendly summary.
 */
export function formatInitSummary(result: InitResult): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('✨ Sparrow initialized successfully!');
  lines.push('');
  lines.push(`📦 Project: ${result.projectName}`);
  lines.push(`📋 Tools configured: ${result.tools.join(', ')}`);
  lines.push(`📄 Config: .sparrow/sparrow.json`);
  lines.push(`📑 Guide: ${result.projectMdPath}`);
  lines.push(`📁 Backend dir: backend/`);
  lines.push('');

  for (const { toolId, files } of result.createdFiles) {
    lines.push(`🔧 ${toolId}:`);
    // Extract skill names from skill file paths (skills/{name}/SKILL.md)
    const skillFiles = files.filter((f) => f.includes('/skills/'));
    const skillNames = new Set(
      skillFiles.map((f) => {
        const parts = f.split('/');
        const skillsIdx = parts.indexOf('skills');
        return skillsIdx >= 0 ? parts[skillsIdx + 1] : null;
      }).filter(Boolean)
    );
    lines.push(`   Skills (${skillNames.size}): ${Array.from(skillNames).sort().join(', ')}`);
    lines.push(`   Files: ${files.length} generated`);
  }

  lines.push('');
  lines.push('🚀 Next steps:');
  lines.push('   1. Start with /sparrow-explore to identify business services');
  lines.push('   2. Run /sparrow-arch to define architecture');
  lines.push('   3. For each bounded context: /sparrow-design → /sparrow-model → /sparrow-plan → /sparrow-apply');
  lines.push('');
  lines.push('   Full pipeline: explore → arch → design → model → plan → apply');

  return lines.join('\n');
}
