/**
 * Project tool config: .sparrow/sparrow-config.json (formerly sparrow.json).
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { CONFIG_FILE, LEGACY_CONFIG_FILE, SPARROW_DIR } from './spec-paths.js';

export function configAbsPath(projectRoot: string): string {
  return join(projectRoot, CONFIG_FILE);
}

export function readProjectConfig(projectRoot: string): Record<string, unknown> {
  const current = join(projectRoot, CONFIG_FILE);
  const legacy = join(projectRoot, LEGACY_CONFIG_FILE);
  if (existsSync(current)) {
    return JSON.parse(readFileSync(current, 'utf-8')) as Record<string, unknown>;
  }
  if (existsSync(legacy)) {
    return JSON.parse(readFileSync(legacy, 'utf-8')) as Record<string, unknown>;
  }
  return {};
}

export function writeProjectConfig(projectRoot: string, config: Record<string, unknown>): string {
  const dest = join(projectRoot, CONFIG_FILE);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  const legacy = join(projectRoot, LEGACY_CONFIG_FILE);
  if (existsSync(legacy)) {
    rmSync(legacy, { force: true });
  }
  return dest;
}

export { SPARROW_DIR };
