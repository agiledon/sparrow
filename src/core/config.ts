/**
 * Tool metadata and detection logic.
 * Defines the registry of supported AI coding assistants.
 */

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
];

/**
 * Look up a tool definition by its id.
 */
export function getToolById(id: string): ToolDefinition | undefined {
  return SUPPORTED_TOOLS.find((t) => t.id === id);
}

/**
 * Get all supported tool ids.
 */
export function getSupportedToolIds(): string[] {
  return SUPPORTED_TOOLS.map((t) => t.id);
}

// ─── Skill Definitions ───────────────────────────────────────────

export interface SkillDefinition {
  /** Skill id (used in file paths) */
  id: string;
  /** Display name */
  name: string;
  /** Short description used in YAML frontmatter */
  description: string;
  /** Execution phase for ordering */
  phase: 'product' | 'team';
  /** Position in the execution order (1-6) */
  order: number;
  /** The next skill to run (null for the last skill) */
  nextSkill: string | null;
  /** Command name (same as id) */
  commandName: string;
  /** Category tag */
  category: string;
}

export const SKILLS: SkillDefinition[] = [
  {
    id: 'sparrow-explore',
    name: 'Sparrow Explore',
    description: 'Identify and define business services from raw requirements',
    phase: 'product',
    order: 1,
    nextSkill: 'sparrow-arch',
    commandName: 'sparrow-explore',
    category: 'DDD',
  },
  {
    id: 'sparrow-arch',
    name: 'Sparrow Arch',
    description: 'Define business architecture and application architecture with bounded contexts',
    phase: 'product',
    order: 2,
    nextSkill: 'sparrow-design',
    commandName: 'sparrow-arch',
    category: 'DDD',
  },
  {
    id: 'sparrow-design',
    name: 'Sparrow Design',
    description: 'Define API contracts and technology stack for a bounded context',
    phase: 'team',
    order: 3,
    nextSkill: 'sparrow-model',
    commandName: 'sparrow-design',
    category: 'DDD',
  },
  {
    id: 'sparrow-model',
    name: 'Sparrow Model',
    description: 'Extract domain model (static and dynamic) for a bounded context',
    phase: 'team',
    order: 4,
    nextSkill: 'sparrow-plan',
    commandName: 'sparrow-model',
    category: 'DDD',
  },
  {
    id: 'sparrow-plan',
    name: 'Sparrow Plan',
    description: 'Devise implementation plan based on spec, API, tech stack, and domain model',
    phase: 'team',
    order: 5,
    nextSkill: 'sparrow-apply',
    commandName: 'sparrow-plan',
    category: 'DDD',
  },
  {
    id: 'sparrow-apply',
    name: 'Sparrow Apply',
    description: 'Execute the implementation plan and generate DDD-structured code',
    phase: 'team',
    order: 6,
    nextSkill: null,
    commandName: 'sparrow-apply',
    category: 'DDD',
  },
];

/**
 * Get a skill definition by id.
 */
export function getSkillById(id: string): SkillDefinition | undefined {
  return SKILLS.find((s) => s.id === id);
}

/**
 * Get all skills in execution order.
 */
export function getOrderedSkills(): SkillDefinition[] {
  return [...SKILLS].sort((a, b) => a.order - b.order);
}
