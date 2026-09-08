/**
 * Skill definitions, specs, and the skill registry.
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
  /** Skill kind: core (DDD pipeline) or supporting (auxiliary) */
  kind: 'core' | 'supporting';
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

export type SkillTemplateFn = () => string;

/**
 * Skill registry — owns all skill-related state (templates, harness assets,
 * core and plugin skill metadata). Created by the composition root and passed
 * explicitly, so no module-level mutable singletons.
 */
export class SkillRegistry {
  private readonly templates = new Map<string, SkillTemplateFn>();
  private readonly harness = new Map<string, string[]>();
  private coreSkills: SkillDefinition[] = [];
  private pluginSkills: SkillDefinition[] = [];

  registerTemplate(id: string, fn: SkillTemplateFn): void {
    this.templates.set(id, fn);
  }

  registerHarness(id: string, paths: string[]): void {
    this.harness.set(id, paths);
  }

  registerCoreSkills(specs: SkillSpec[]): void {
    this.coreSkills = [...specs];
  }

  registerPluginSkills(skills: SkillDefinition[]): void {
    this.pluginSkills = [...skills];
  }

  getTemplate(id: string): SkillTemplateFn | undefined {
    return this.templates.get(id);
  }

  getHarness(id: string): string[] {
    return this.harness.get(id) || [];
  }

  getOrderedSkills(): SkillDefinition[] {
    return [...this.coreSkills, ...this.pluginSkills].sort((a, b) => a.order - b.order);
  }
}
