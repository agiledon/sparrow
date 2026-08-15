/**
 * Skill definitions and ordering.
 * Defines the core skill registry and plugin skill registration.
 */

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

/**
 * Self-describing skill spec: metadata + harness assets + markdown body.
 * Each skill declares one of these in its own module; the registry collects them.
 */
export interface SkillSpec extends SkillDefinition {
  /** Relative harness asset paths (empty if none) */
  harness: string[];
  /** Full markdown body */
  body: string;
}

let _coreSkills: SkillDefinition[] = [];
let _pluginSkills: SkillDefinition[] = [];

/**
 * Register core skill specs (idempotent by replacement).
 */
export function registerCoreSkills(specs: SkillSpec[]): void {
  _coreSkills = [...specs];
}

/**
 * Replace the set of plugin skills. Idempotent by replacement: repeated calls
 * with the same input do not accumulate duplicates.
 */
export function registerPluginSkills(skills: SkillDefinition[]): void {
  _pluginSkills = [...skills];
}

/**
 * Get all skills (core + plugin) in execution order.
 */
export function getOrderedSkills(): SkillDefinition[] {
  return [..._coreSkills, ..._pluginSkills].sort((a, b) => a.order - b.order);
}
