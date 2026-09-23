/**
 * Shared types and constants for sparrow-state.json.
 */

export type DevelopmentMode = 'tbd' | 'greenfield' | 'brownfield' | 'iteration';
export type PipelineStatus = 'ongoing' | 'done';
export type PipelineStep =
  | 'requirement'
  | 'architecture'
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

export const MODES = new Set<DevelopmentMode>(['tbd', 'greenfield', 'brownfield', 'iteration']);
export const STEPS = new Set<PipelineStep>([
  'requirement',
  'architecture',
  'design',
  'model',
  'plan',
  'apply',
  'verify',
  'archive',
]);
export const STATUSES = new Set<PipelineStatus>(['ongoing', 'done']);

export function normalizeProjectState(raw: unknown): SparrowProjectState {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const active =
    src['active-change'] && typeof src['active-change'] === 'object'
      ? (src['active-change'] as Record<string, unknown>)
      : {};
  const changeId =
    typeof active.changeId === 'string' && active.changeId.length > 0 ? active.changeId : null;
  const mode = MODES.has(src['development-mode'] as DevelopmentMode)
    ? (src['development-mode'] as DevelopmentMode)
    : 'tbd';
  let pipeline: PipelineState | null = null;
  if (mode !== 'tbd' && src.pipeline && typeof src.pipeline === 'object') {
    const p = src.pipeline as Record<string, unknown>;
    const step = STEPS.has(p['current-step'] as PipelineStep)
      ? (p['current-step'] as PipelineStep)
      : 'requirement';
    const status = STATUSES.has(p.status as PipelineStatus)
      ? (p.status as PipelineStatus)
      : 'ongoing';
    const contexts: Record<string, PipelineContextState> = {};
    if (p.contexts && typeof p.contexts === 'object') {
      for (const [slug, value] of Object.entries(p.contexts as Record<string, unknown>)) {
        if (!value || typeof value !== 'object') continue;
        const c = value as Record<string, unknown>;
        if (!STEPS.has(c['current-step'] as PipelineStep) || !STATUSES.has(c.status as PipelineStatus)) {
          continue;
        }
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
