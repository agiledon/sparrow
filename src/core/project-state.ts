/**
 * Pipeline state: .sparrow/sparrow-state.json
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import {
  CHANGE_ARCHIVE,
  CHANGE_CURRENT,
  LEGACY_ACTIVE_CHANGE_FILE,
  MASTER_ROOT,
  SPARROW_DIR,
  SPARROW_DOCS,
  STATE_FILE,
} from './spec-paths.js';

export type DevelopmentMode = 'tbd' | 'greenfield' | 'brownfield' | 'iteration';
export type PipelineStatus = 'ongoing' | 'done';
export type PipelineStep =
  | 'requirement'
  | 'arch'
  | 'design'
  | 'model'
  | 'plan'
  | 'apply'
  | 'verify'
  | 'archive';

export interface PipelineContextState {
  'current-step': PipelineStep;
  status: PipelineStatus;
}

export interface PipelineState {
  'current-step': PipelineStep;
  status: PipelineStatus;
  contexts: Record<string, PipelineContextState>;
}

export interface SparrowProjectState {
  'active-change': { changeId: string | null };
  'development-mode': DevelopmentMode;
  pipeline: PipelineState | null;
}

export const DEFAULT_PROJECT_STATE: SparrowProjectState = {
  'active-change': { changeId: null },
  'development-mode': 'tbd',
  pipeline: null,
};

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

export function stateAbsPath(projectRoot: string): string {
  return join(projectRoot, STATE_FILE);
}

export function projectStateExists(projectRoot: string): boolean {
  return existsSync(stateAbsPath(projectRoot));
}

export function normalizeProjectState(raw: unknown): SparrowProjectState {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const active = src['active-change'] && typeof src['active-change'] === 'object'
    ? (src['active-change'] as Record<string, unknown>)
    : {};
  const changeId = typeof active.changeId === 'string' && active.changeId.length > 0 ? active.changeId : null;
  const mode = MODES.has(src['development-mode'] as DevelopmentMode)
    ? (src['development-mode'] as DevelopmentMode)
    : 'tbd';
  let pipeline: PipelineState | null = null;
  if (mode !== 'tbd' && src.pipeline && typeof src.pipeline === 'object') {
    const p = src.pipeline as Record<string, unknown>;
    const step = STEPS.has(p['current-step'] as PipelineStep) ? (p['current-step'] as PipelineStep) : 'requirement';
    const status = STATUSES.has(p.status as PipelineStatus) ? (p.status as PipelineStatus) : 'ongoing';
    const contexts: Record<string, PipelineContextState> = {};
    if (p.contexts && typeof p.contexts === 'object') {
      for (const [slug, value] of Object.entries(p.contexts as Record<string, unknown>)) {
        if (!value || typeof value !== 'object') continue;
        const c = value as Record<string, unknown>;
        if (!STEPS.has(c['current-step'] as PipelineStep) || !STATUSES.has(c.status as PipelineStatus)) continue;
        contexts[slug] = {
          'current-step': c['current-step'] as PipelineStep,
          status: c.status as PipelineStatus,
        };
      }
    }
    pipeline = { 'current-step': step, status, contexts };
  }
  return {
    'active-change': { changeId },
    'development-mode': mode,
    pipeline: mode === 'tbd' ? null : pipeline,
  };
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
export function ensureProjectState(projectRoot: string): { created: boolean; path: string; state: SparrowProjectState } {
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
  const source = hasSourceFiles(projectRoot);
  if (source) {
    reasons.push('archive and change are empty; source files found');
    return { mode: 'brownfield', reasons };
  }
  reasons.push('archive and change are empty; no source files found');
  return { mode: 'greenfield', reasons };
}

export function applyChangeId(state: SparrowProjectState, changeId: string | null): SparrowProjectState {
  return normalizeProjectState({
    ...state,
    'active-change': { changeId },
  });
}

export function applyDevelopmentMode(state: SparrowProjectState, mode: DevelopmentMode): SparrowProjectState {
  const next = { ...state, 'development-mode': mode };
  if (mode === 'tbd' || mode === 'brownfield') {
    next.pipeline = null;
  }
  return normalizeProjectState(next);
}

export function applyPipelineStep(
  state: SparrowProjectState,
  step: PipelineStep,
  status: PipelineStatus
): SparrowProjectState {
  if (state['development-mode'] === 'tbd') {
    throw new Error('Cannot set pipeline while development-mode is tbd');
  }
  const pipeline: PipelineState = state.pipeline ?? {
    'current-step': step,
    status,
    contexts: {},
  };
  pipeline['current-step'] = step;
  pipeline.status = status;
  return normalizeProjectState({ ...state, pipeline });
}

export function applyPipelineContext(
  state: SparrowProjectState,
  slug: string,
  step: PipelineStep,
  status: PipelineStatus
): SparrowProjectState {
  if (state['development-mode'] === 'tbd') {
    throw new Error('Cannot set pipeline while development-mode is tbd');
  }
  const pipeline: PipelineState = state.pipeline ?? {
    'current-step': step,
    status,
    contexts: {},
  };
  pipeline['current-step'] = step;
  pipeline.status = status;
  pipeline.contexts = { ...pipeline.contexts, [slug]: { 'current-step': step, status } };
  return normalizeProjectState({ ...state, pipeline });
}

export function applyArchiveComplete(state: SparrowProjectState): SparrowProjectState {
  const mode = state['development-mode'] === 'greenfield' ? 'iteration' : state['development-mode'];
  return normalizeProjectState({
    'active-change': { changeId: null },
    'development-mode': mode === 'tbd' ? 'iteration' : mode,
    pipeline: null,
  });
}
