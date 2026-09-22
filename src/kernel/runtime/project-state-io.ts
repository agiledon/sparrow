/**
 * Load / save / migrate .sparrow/sparrow-state.json and wipe spec trees.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  CHANGE_ARCHIVE,
  CHANGE_CURRENT,
  LEGACY_ACTIVE_CHANGE_FILE,
  MASTER_ROOT,
  SPARROW_DIR,
  STATE_FILE,
} from './spec-paths.js';
import {
  DEFAULT_PROJECT_STATE,
  normalizeProjectState,
  type SparrowProjectState,
} from './project-state-types.js';

export function stateAbsPath(projectRoot: string): string {
  return join(projectRoot, STATE_FILE);
}

export function projectStateExists(projectRoot: string): boolean {
  return existsSync(stateAbsPath(projectRoot));
}

export function loadProjectState(projectRoot: string): SparrowProjectState {
  const path = stateAbsPath(projectRoot);
  if (!existsSync(path)) {
    return { ...DEFAULT_PROJECT_STATE, 'active-change': { changeId: null }, pipeline: null };
  }
  try {
    return normalizeProjectState(JSON.parse(readFileSync(path, 'utf-8')));
  } catch {
    return { ...DEFAULT_PROJECT_STATE };
  }
}

export function saveProjectState(projectRoot: string, state: SparrowProjectState): string {
  const normalized = normalizeProjectState(state);
  const dest = stateAbsPath(projectRoot);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(normalized, null, 2) + '\n', 'utf-8');
  return dest;
}

function readLegacyChangeId(projectRoot: string): string | null {
  const legacy = join(projectRoot, LEGACY_ACTIVE_CHANGE_FILE);
  if (!existsSync(legacy)) return null;
  try {
    const data = JSON.parse(readFileSync(legacy, 'utf-8')) as { changeId?: unknown };
    return typeof data.changeId === 'string' && data.changeId.length > 0 ? data.changeId : null;
  } catch {
    return null;
  }
}

function deleteLegacyActiveChange(projectRoot: string): void {
  const legacy = join(projectRoot, LEGACY_ACTIVE_CHANGE_FILE);
  if (existsSync(legacy)) {
    rmSync(legacy, { force: true });
  }
}

/**
 * Create sparrow-state.json if missing. Never overwrites an existing file.
 * Migrates changeId from active-change.json and deletes that file.
 */
export function ensureProjectState(
  projectRoot: string
): { created: boolean; path: string; state: SparrowProjectState } {
  mkdirSync(join(projectRoot, SPARROW_DIR), { recursive: true });
  const path = stateAbsPath(projectRoot);
  if (existsSync(path)) {
    const state = loadProjectState(projectRoot);
    deleteLegacyActiveChange(projectRoot);
    return { created: false, path, state };
  }
  const migratedId = readLegacyChangeId(projectRoot);
  const state = normalizeProjectState({
    ...DEFAULT_PROJECT_STATE,
    'active-change': { changeId: migratedId },
  });
  saveProjectState(projectRoot, state);
  deleteLegacyActiveChange(projectRoot);
  return { created: true, path, state };
}

export function resetProjectState(projectRoot: string): string {
  return saveProjectState(projectRoot, DEFAULT_PROJECT_STATE);
}

function emptyDirContents(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

/** Delete all spec files under master / change (keep empty directory skeleton). */
export function wipeSpecTrees(projectRoot: string): void {
  emptyDirContents(join(projectRoot, MASTER_ROOT));
  emptyDirContents(join(projectRoot, CHANGE_CURRENT));
  emptyDirContents(join(projectRoot, CHANGE_ARCHIVE));
}
