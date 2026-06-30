import * as esbuild from 'esbuild';
import { rmSync, mkdirSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const distDir = join(root, 'dist');
const binDir = join(root, 'bin');

// Clean previous build
rmSync(distDir, { recursive: true, force: true });
rmSync(binDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
mkdirSync(binDir, { recursive: true });

// Build main library
const mainResult = await esbuild.build({
  entryPoints: [
    join(root, 'src', 'cli', 'index.ts'),
  ],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outdir: distDir,
  sourcemap: true,
  external: [
    'commander',
    'js-yaml',
    '@inquirer/prompts',
  ],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
});

if (mainResult.errors.length > 0) {
  console.error('Build failed:', mainResult.errors);
  process.exit(1);
}

// Build CLI entry point
const cliResult = await esbuild.build({
  entryPoints: [
    join(root, 'src', 'cli', 'index.ts'),
  ],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: join(binDir, 'sparrow.js'),
  sourcemap: true,
  external: [
    'commander',
    'js-yaml',
    '@inquirer/prompts',
  ],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
});

if (cliResult.errors.length > 0) {
  console.error('CLI build failed:', cliResult.errors);
  process.exit(1);
}

console.log('✅ Build complete: dist/ and bin/sparrow.js');
