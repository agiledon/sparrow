#!/usr/bin/env node
/**
 * Sparrow CLI entry.
 *
 * In a git checkout (`npm link` / local path), run TypeScript source so skill
 * templates stay current without rebuilding. A published install has no `src/`,
 * so this loads the esbuild bundle from `dist/`.
 */
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcCli = join(root, 'src', 'cli', 'index.ts');
const distCli = join(root, 'dist', 'sparrow.js');

if (existsSync(srcCli)) {
  const require = createRequire(join(root, 'package.json'));
  let tsx;
  try {
    tsx = require.resolve('tsx');
  } catch {
    tsx = undefined;
  }
  if (tsx) {
    const result = spawnSync(
      process.execPath,
      [
        '--import',
        join(root, 'scripts', 'register-assets.mjs'),
        '--import',
        tsx,
        srcCli,
        ...process.argv.slice(2),
      ],
      { stdio: 'inherit' },
    );
    process.exit(result.status === null ? 1 : result.status);
  }
}

if (!existsSync(distCli)) {
  console.error(
    'Sparrow CLI bundle not found. In a git checkout run: npm install && npm run build',
  );
  process.exit(1);
}

await import(pathToFileURL(distCli).href);
