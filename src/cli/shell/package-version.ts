/**
 * Sparrow package version resolution.
 *
 * Single source of truth: the `version` field in `package.json`. Avoids
 * hard-coded version constants that drift out of sync with the published
 * package version.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Read the `version` field from the given package.json file. */
export function readPackageVersion(packageJsonPath: string): string {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  return pkg.version;
}

/** Resolve the sparrow-ddd package.json by walking up from this module. */
export function resolveSparrowPackageJson(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 10; i++) {
    const candidate = join(dir, 'package.json');
    if (existsSync(candidate)) {
      try {
        const pkg = JSON.parse(readFileSync(candidate, 'utf-8'));
        if (pkg.name === 'sparrow-ddd') return candidate;
      } catch {
        // not a valid package.json — keep walking up
      }
    }
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error('sparrow-ddd package.json not found');
}

/** The Sparrow framework version (single source of truth). */
export function getSparrowVersion(): string {
  return readPackageVersion(resolveSparrowPackageJson());
}
