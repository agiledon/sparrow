/**
 * Sparrow config aggregator.
 *
 * Compatibility re-export barrel. The tool registry lives in `tools.ts` and
 * the skill registry in `skills.ts`; import directly from those modules or
 * through this barrel as needed.
 */

export * from './tools.js';
export { SkillRegistry, type SkillDefinition, type SkillSpec } from '../../kernel/skill/registry.js';
