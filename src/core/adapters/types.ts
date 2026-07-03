/**
 * Tool Command Adapter interface.
 * Each supported AI coding tool has an adapter that knows
 * where to place skill files and how to format them.
 */

export interface CommandContent {
  /** Skill/command id (e.g., 'sparrow-explore') */
  id: string;
  /** Display name */
  name: string;
  /** Short description for YAML frontmatter */
  description: string;
  /** Full markdown body with the instructions */
  body: string;
  /** Category (used for grouping in some tools) */
  category: string;
  /** Tags for discovery */
  tags: string[];
}

export interface ToolCommandAdapter {
  /** The tool id this adapter handles */
  toolId: string;
  /** Get the file path for a skill SKILL.md */
  getSkillPath(skillId: string): string;
  /** Get the file path for a slash command, or null if the tool discovers commands from skills */
  getCommandPath(skillId: string): string | null;
  /** Format content as a SKILL.md file */
  formatSkill(content: CommandContent): string;
  /** Format content as a slash command file */
  formatCommand(content: CommandContent): string;
}
