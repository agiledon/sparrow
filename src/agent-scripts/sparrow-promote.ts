/**
 * Mechanical promote helper for agents. Run from the project root.
 *
 * Source: src/core/spec-promote.ts. Bundled into
 * src/schemas/templates/shared/scripts/sparrow-promote.mjs by
 * scripts/generate-sparrow-promote-mjs.mjs — do not edit the .mjs by hand.
 *
 *   node scripts/sparrow-promote.mjs <change-id> <synced-at> [--source current|archive] [--folder <name>] [--slugs a,b]
 */

import { promoteChangeToMaster, type PromoteOptions } from '../core/spec-promote.js';

function failUsage(): never {
  console.error('Usage:');
  console.error(
    '  node scripts/sparrow-promote.mjs <change-id> <synced-at> [--source current|archive] [--folder <archiveFolderName>] [--slugs slug1,slug2]'
  );
  process.exit(2);
}

function parseArgs(argv: string[]): {
  changeId: string;
  syncedAt: string;
  options: PromoteOptions;
} {
  const positional: string[] = [];
  const options: PromoteOptions = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--source') {
      const v = argv[++i];
      if (v !== 'current' && v !== 'archive') failUsage();
      options.source = v;
    } else if (a === '--folder') {
      options.archiveFolderName = argv[++i];
      if (!options.archiveFolderName) failUsage();
    } else if (a === '--slugs') {
      const raw = argv[++i];
      if (!raw) failUsage();
      options.slugAllowlist = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (a.startsWith('-')) {
      failUsage();
    } else {
      positional.push(a);
    }
  }
  if (positional.length < 2) failUsage();
  return { changeId: positional[0], syncedAt: positional[1], options };
}

const { changeId, syncedAt, options } = parseArgs(process.argv.slice(2));
if (!/^\d{4}-\d{2}-\d{2}$/.test(syncedAt)) {
  console.error('synced-at must be YYYY-MM-DD');
  process.exit(1);
}

try {
  const result = promoteChangeToMaster(process.cwd(), changeId, syncedAt, options);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
