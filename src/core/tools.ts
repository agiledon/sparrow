/**
 * Tool metadata and detection logic.
 * Defines the registry of supported AI coding assistants.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

export interface ToolDefinition {
  /** Unique tool identifier */
  id: string;
  /** Human-readable tool name */
  name: string;
  /** Directory where skill files should be placed (relative to project root) */
  skillsDir: string;
  /** Directory where command/slash-command files should be placed */
  commandsDir: string;
  /** Format category for the tool */
  format: 'claude-style' | 'opencode-style' | 'cursor-style';
  /** Files or directories that indicate this tool is installed */
  detectionPaths: string[];
}

/** All supported AI coding assistants */
export const SUPPORTED_TOOLS: ToolDefinition[] = [
  {
    id: 'claude',
    name: 'Claude Code',
    skillsDir: '.claude/skills',
    commandsDir: '.claude/commands/sparrow',
    format: 'claude-style',
    detectionPaths: ['.claude', '.claude/settings.json', '.claude/settings.local.json'],
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    skillsDir: '.opencode/skills',
    commandsDir: '.opencode/commands',
    format: 'opencode-style',
    detectionPaths: ['.opencode', '.opencode/config.json'],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    skillsDir: '.cursor/skills',
    commandsDir: '.cursor/commands',
    format: 'cursor-style',
    detectionPaths: ['.cursor', '.cursorrules', '.cursor/rules'],
  },
  {
    id: 'codex',
    name: 'Codex (OpenAI)',
    skillsDir: '.codex/skills',
    commandsDir: '.codex/commands',
    format: 'claude-style',
    detectionPaths: ['.codex', '.codex/AGENTS.md'],
  },
  {
    id: 'kiro',
    name: 'Kiro',
    skillsDir: '.kiro/skills',
    commandsDir: '<from skills>',
    format: 'claude-style',
    detectionPaths: ['.kiro'],
  },
  {
    id: 'qoder',
    name: 'Qoder',
    skillsDir: '.qoder/skills',
    commandsDir: '.qoder/commands',
    format: 'claude-style',
    detectionPaths: ['.qoder'],
  },
  {
    id: 'trae',
    name: 'Trae',
    skillsDir: '.trae/skills',
    commandsDir: '.trae/commands',
    format: 'claude-style',
    detectionPaths: ['.trae'],
  },
  {
    id: 'pi',
    name: 'Pi',
    skillsDir: '.pi/skills',
    commandsDir: '.pi/prompts',
    format: 'opencode-style',
    detectionPaths: ['.pi', '.pi/settings.json'],
  },
];

/**
 * Get all supported tool ids.
 */
export function getSupportedToolIds(): string[] {
  return SUPPORTED_TOOLS.map((t) => t.id);
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
