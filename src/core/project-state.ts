/**
 * Pipeline state facade: .sparrow/sparrow-state.json
 *
 * Split by responsibility:
 * - project-state-types — types + normalize
 * - project-state-io — load/save/migrate/wipe
 * - development-mode — greenfield/brownfield/iteration detection
 * - archive-readiness — check-archive / prune-contexts
 */

import {
  normalizeProjectState,
  type DevelopmentMode,
  type PipelineState,
  type PipelineStatus,
  type PipelineStep,
  type SparrowProjectState,
} from './project-state-types.js';

export type {
  DevelopmentMode,
  PipelineContextState,
  PipelineState,
  PipelineStatus,
  PipelineStep,
  SparrowProjectState,
} from './project-state-types.js';
export { DEFAULT_PROJECT_STATE, normalizeProjectState } from './project-state-types.js';

export {
  ensureProjectState,
  loadProjectState,
  projectStateExists,
  resetProjectState,
  saveProjectState,
  stateAbsPath,
  wipeSpecTrees,
} from './project-state-io.js';

export { detectDevelopmentMode, type DetectModeResult } from './development-mode.js';

export {
  applyPruneContexts,
  checkArchiveReadiness,
  isSlugArchiveReady,
  prunePipelineContexts,
  type ArchiveReadiness,
  type ArchiveSlugStatus,
} from './archive-readiness.js';

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
