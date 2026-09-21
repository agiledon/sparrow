import * as esbuild from 'esbuild';
import { rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const distDir = join(root, 'dist');

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

const result = await esbuild.build({
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  sourcemap: true,
  loader: {
    '.md': 'text',
    '.yaml': 'text',
    '.html': 'text',
    '.mjs': 'text',
  },
  external: [
    'commander',
    'js-yaml',
    '@inquirer/prompts',
    'mammoth',
    'word-extractor',
    'unpdf',
    'tesseract.js',
  ],
  banner: {
    js:
      '#!/usr/bin/env node\n' +
      'import { createRequire } from \'module\'; const require = createRequire(import.meta.url);',
  },
  entryPoints: [join(root, 'src', 'cli', 'index.ts')],
  outfile: join(distDir, 'sparrow.js'),
});

if (result.errors.length > 0) {
  console.error('Build failed:', result.errors);
  process.exit(1);
}

console.log('✅ Build complete: dist/sparrow.js');
