/**
 * Mechanical sparrow-state.json helper. Run from the project root.
 *
 * Source of truth: src/kernel/runtime/project-state.ts (and related).
 * This file is the agent-facing CLI entry; bundled into
 * src/content/workflows/_shared/scripts/sparrow-state.mjs by
 * scripts/generate-sparrow-state-mjs.mjs — do not edit the .mjs by hand.
 *
 *   node scripts/sparrow-state.mjs show
 *   node scripts/sparrow-state.mjs detect-mode
 *   node scripts/sparrow-state.mjs set-mode <tbd|greenfield|brownfield|iteration>
 *   node scripts/sparrow-state.mjs set-change <id|null>
 *   node scripts/sparrow-state.mjs set-step <step> <ongoing|done>
 *   node scripts/sparrow-state.mjs set-context <slug> <step> <ongoing|done>
 *   node scripts/sparrow-state.mjs check-archive [change-id]
 *   node scripts/sparrow-state.mjs prune-contexts <slug> [slug...]
 *   node scripts/sparrow-state.mjs archive-done
 */

import {
  applyArchiveComplete,
  applyChangeId,
  applyDevelopmentMode,
  applyPipelineContext,
  applyPipelineStep,
  applyPruneContexts,
  checkArchiveReadiness,
  detectDevelopmentMode,
  loadProjectState,
  saveProjectState,
  type DevelopmentMode,
  type PipelineStatus,
  type PipelineStep,
} from '../kernel/runtime/project-state.js';

const MODES = new Set<DevelopmentMode>(['tbd', 'greenfield', 'brownfield', 'iteration']);
const STEPS = new Set<PipelineStep>([
  'requirement',
  'arch',
  'design',
  'model',
  'plan',
  'apply',
  'verify',
  'archive',
]);
const STATUSES = new Set<PipelineStatus>(['ongoing', 'done']);

function failUsage(): never {
  console.error('Usage:');
  console.error('  node scripts/sparrow-state.mjs show');
  console.error('  node scripts/sparrow-state.mjs detect-mode');
  console.error('  node scripts/sparrow-state.mjs set-mode <tbd|greenfield|brownfield|iteration>');
  console.error('  node scripts/sparrow-state.mjs set-change <id|null>');
  console.error('  node scripts/sparrow-state.mjs set-step <step> <ongoing|done>');
  console.error('  node scripts/sparrow-state.mjs set-context <slug> <step> <ongoing|done>');
  console.error('  node scripts/sparrow-state.mjs check-archive [change-id]');
  console.error('  node scripts/sparrow-state.mjs prune-contexts <slug> [slug...]');
  console.error('  node scripts/sparrow-state.mjs archive-done');
  process.exit(2);
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

const root = process.cwd();
const [cmd, ...args] = process.argv.slice(2);

if (cmd === 'show') {
  printJson(loadProjectState(root));
  process.exit(0);
}

if (cmd === 'detect-mode') {
  printJson(detectDevelopmentMode(root));
  process.exit(0);
}

if (cmd === 'set-mode') {
  const mode = args[0] as DevelopmentMode;
  if (!MODES.has(mode)) failUsage();
  printJson(saveProjectState(root, applyDevelopmentMode(loadProjectState(root), mode)));
  process.exit(0);
}

if (cmd === 'set-change') {
  const raw = args[0];
  if (!raw) failUsage();
  const id = raw === 'null' ? null : raw;
  if (id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    console.error('change-id must be kebab-case or null.');
    process.exit(1);
  }
  printJson(saveProjectState(root, applyChangeId(loadProjectState(root), id)));
  process.exit(0);
}

if (cmd === 'set-step') {
  const [step, status] = args as [PipelineStep, PipelineStatus];
  if (!STEPS.has(step) || !STATUSES.has(status)) failUsage();
  try {
    printJson(saveProjectState(root, applyPipelineStep(loadProjectState(root), step, status)));
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
  process.exit(0);
}

if (cmd === 'set-context') {
  const [slug, step, status] = args as [string, PipelineStep, PipelineStatus];
  if (!slug || !STEPS.has(step) || !STATUSES.has(status)) failUsage();
  try {
    printJson(
      saveProjectState(root, applyPipelineContext(loadProjectState(root), slug, step, status))
    );
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
  process.exit(0);
}

if (cmd === 'check-archive') {
  printJson(checkArchiveReadiness(root, args[0]));
  process.exit(0);
}

if (cmd === 'prune-contexts') {
  if (args.length === 0) failUsage();
  printJson(applyPruneContexts(root, args));
  process.exit(0);
}

if (cmd === 'archive-done') {
  printJson(saveProjectState(root, applyArchiveComplete(loadProjectState(root))));
  process.exit(0);
}

failUsage();
