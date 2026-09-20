/**
 * Detect greenfield / brownfield / iteration from workspace contents.
 */

import { existsSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import {
  CHANGE_ARCHIVE,
  CHANGE_CURRENT,
  MASTER_ROOT,
  SPARROW_DOCS,
} from './spec-paths.js';
import type { DevelopmentMode } from './project-state-types.js';

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.sparrow',
  '.cursor',
  '.claude',
  '.codex',
  '.opencode',
  '.qoder',
  '.trae',
  '.pi',
  '.kiro',
  'vendor',
  '.github',
  'bin',
]);

const SOURCE_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.py',
  '.go',
  '.java',
  '.kt',
  '.cs',
  '.rb',
  '.rs',
  '.php',
  '.swift',
  '.c',
  '.cc',
  '.cpp',
  '.h',
  '.hpp',
  '.m',
  '.mm',
  '.scala',
  '.vue',
  '.svelte',
]);

function dirHasFiles(dir: string): boolean {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return false;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (dirHasFiles(full)) return true;
    } else {
      return true;
    }
  }
  return false;
}

function hasSourceFiles(projectRoot: string): boolean {
  const skipAbs = join(projectRoot, SPARROW_DOCS);
  const walk = (dir: string): boolean => {
    if (!existsSync(dir) || !statSync(dir).isDirectory()) return false;
    for (const name of readdirSync(dir)) {
      if (IGNORE_DIRS.has(name)) continue;
      const full = join(dir, name);
      if (full === skipAbs || full.startsWith(skipAbs + '/') || full.startsWith(skipAbs + '\\')) continue;
      const st = statSync(full);
      if (st.isDirectory()) {
        if (walk(full)) return true;
      } else if (SOURCE_EXT.has(extname(name).toLowerCase())) {
        return true;
      }
    }
    return false;
  };
  return walk(projectRoot);
}

export interface DetectModeResult {
  mode: Exclude<DevelopmentMode, 'tbd'>;
  reasons: string[];
}

export function detectDevelopmentMode(projectRoot: string): DetectModeResult {
  const reasons: string[] = [];
  const currentHas = dirHasFiles(join(projectRoot, CHANGE_CURRENT));
  const archiveHas = dirHasFiles(join(projectRoot, CHANGE_ARCHIVE));
  const masterHas = dirHasFiles(join(projectRoot, MASTER_ROOT));
  if (currentHas) reasons.push('change/current has documents');
  if (archiveHas) reasons.push('change/archive has documents');
  if (masterHas) reasons.push('master has documents');
  if (currentHas || archiveHas || masterHas) {
    return { mode: 'iteration', reasons };
  }
  if (hasSourceFiles(projectRoot)) {
    reasons.push('archive and change are empty; source files found');
    return { mode: 'brownfield', reasons };
  }
  reasons.push('archive and change are empty; no source files found');
  return { mode: 'greenfield', reasons };
}
