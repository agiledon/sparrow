/**
 * Archive readiness gate and partial-archive context pruning.
 */

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { CHANGE_CURRENT } from './spec-paths.js';
import {
  normalizeProjectState,
  type PipelineContextState,
  type PipelineStatus,
  type PipelineStep,
  type SparrowProjectState,
} from './project-state-types.js';
import { loadProjectState, saveProjectState } from './project-state-io.js';

export interface ArchiveSlugStatus {
  slug: string;
  'current-step': PipelineStep | null;
  status: PipelineStatus | null;
  ready: boolean;
  reason: string;
}

export interface ArchiveReadiness {
  changeId: string | null;
  pipelineStep: PipelineStep | null;
  pipelineStatus: PipelineStatus | null;
  ready: ArchiveSlugStatus[];
  incomplete: ArchiveSlugStatus[];
  allComplete: boolean;
  canPartialArchive: boolean;
}

function listDesignSlugs(projectRoot: string, changeId: string): string[] {
  const dir = join(projectRoot, CHANGE_CURRENT, changeId, 'design');
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir)
    .filter((name) => statSync(join(dir, name)).isDirectory())
    .sort();
}

export function isSlugArchiveReady(ctx: PipelineContextState | undefined): boolean {
  return ctx?.['current-step'] === 'verify' && ctx?.status === 'done';
}

/**
 * Summarize which BC / interaction-context slugs are ready to archive.
 * Slug set = pipeline.contexts keys ∪ design/* under the change workspace.
 */
export function checkArchiveReadiness(
  projectRoot: string,
  changeId?: string | null
): ArchiveReadiness {
  const state = loadProjectState(projectRoot);
  const id = changeId ?? state['active-change'].changeId;
  const contexts = state.pipeline?.contexts ?? {};
  const designSlugs = id ? listDesignSlugs(projectRoot, id) : [];
  const slugSet = new Set([...Object.keys(contexts), ...designSlugs]);

  const ready: ArchiveSlugStatus[] = [];
  const incomplete: ArchiveSlugStatus[] = [];

  for (const slug of [...slugSet].sort()) {
    const ctx = contexts[slug];
    if (isSlugArchiveReady(ctx)) {
      ready.push({
        slug,
        'current-step': ctx['current-step'],
        status: ctx.status,
        ready: true,
        reason: 'verify done',
      });
    } else {
      const step = ctx?.['current-step'] ?? null;
      const status = ctx?.status ?? null;
      let reason = 'missing pipeline context';
      if (ctx) {
        reason =
          step === 'verify' && status !== 'done'
            ? 'verify not done'
            : `at ${step}/${status}; need verify/done`;
      }
      incomplete.push({
        slug,
        'current-step': step,
        status,
        ready: false,
        reason,
      });
    }
  }

  return {
    changeId: id,
    pipelineStep: state.pipeline?.['current-step'] ?? null,
    pipelineStatus: state.pipeline?.status ?? null,
    ready,
    incomplete,
    allComplete: incomplete.length === 0 && ready.length > 0,
    canPartialArchive: ready.length > 0,
  };
}

/** Remove completed slugs from pipeline.contexts after a partial archive; keep changeId. */
export function prunePipelineContexts(
  state: SparrowProjectState,
  slugs: string[]
): SparrowProjectState {
  if (!state.pipeline) return normalizeProjectState(state);
  const remove = new Set(slugs);
  const contexts = { ...state.pipeline.contexts };
  for (const slug of remove) {
    delete contexts[slug];
  }
  return normalizeProjectState({
    ...state,
    pipeline: {
      ...state.pipeline,
      contexts,
    },
  });
}

export function applyPruneContexts(projectRoot: string, slugs: string[]): SparrowProjectState {
  const next = prunePipelineContexts(loadProjectState(projectRoot), slugs);
  saveProjectState(projectRoot, next);
  return next;
}
