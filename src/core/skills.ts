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

export const SKILLS: SkillDefinition[] = [
  {
    id: 'sparrow-harness',
    name: 'Sparrow Harness',
    description: 'View, add, and maintain constraint assets (harness) for the project',
    phase: 'product',
    order: 0,
    nextSkill: 'sparrow-explore',
    commandName: 'sparrow-harness',
    category: 'DDD',
  },
  {
    id: 'sparrow-explore',
    name: 'Sparrow Explore',
    description: 'Identify business services and explore UI design from raw requirements',
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
  {
    id: 'sparrow-archive',
    name: 'Sparrow Archive',
    description: 'Archive a completed change (revise workflow) into docs/sparrow/changes/archive/',
    phase: 'team',
    order: 7,
    nextSkill: null,
    commandName: 'sparrow-archive',
    category: 'DDD',
  },
];

let _pluginSkills: SkillDefinition[] = [];

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
  return [...SKILLS, ..._pluginSkills].sort((a, b) => a.order - b.order);
}
