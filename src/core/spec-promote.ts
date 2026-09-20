/**
 * Promote archived change specs into master/ with append-only delta sync.
 *
 * Never deletes existing master files. ADDED creates new files; MODIFIED appends
 * a marked delta block; REMOVED is recorded in revision-history only.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import {
  CHANGE_ARCHIVE,
  CHANGE_CURRENT,
  MASTER_DESIGN_HISTORY,
  MASTER_REQUIREMENT_HISTORY,
  MASTER_ROOT,
} from './spec-paths.js';
import { skillExtras } from '../schemas/bundled-content.js';

export type DeltaKind = 'ADDED' | 'MODIFIED' | 'REMOVED';

export interface PromoteDelta {
  path: string;
  kind: DeltaKind;
  /** BC / interaction-context slug, or "shared" for product-level paths */
  slug: string;
}

export interface PromoteOptions {
  source?: 'current' | 'archive';
  archiveFolderName?: string;
  /** When set, only promote design/{slug}/ for these slugs (plus shared paths). */
  slugAllowlist?: string[];
}

export interface PromoteResult {
  promotedFiles: string[];
  deltas: PromoteDelta[];
  requirementHistoryAppended: boolean;
  designHistoryAppended: boolean;
}

function listFilesRecursive(dir: string, base = dir): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listFilesRecursive(full, base));
    } else {
      out.push(relative(base, full).split('\\').join('/'));
    }
  }
  return out;
}

function shouldSkipPromote(rel: string): boolean {
  const norm = rel.replace(/\\/g, '/');
  if (norm === 'proposal.md') return true;
  return /^design\/[^/]+\/plan\.md$/.test(norm);
}

function archiveAsset(name: string): string {
  const body = skillExtras['sparrow-archive']?.[`assets/${name}`];
  if (!body) {
    throw new Error(`Missing archive asset: ${name}`);
  }
  return body;
}

export function classifyPromoteGroup(rel: string): string {
  const norm = rel.replace(/\\/g, '/');
  const m = /^design\/([^/]+)\//.exec(norm);
  return m ? m[1] : 'shared';
}

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\s+$/g, '');
}

function isUnderAllowlist(rel: string, allowlist: string[] | undefined): boolean {
  if (!allowlist) return true;
  const group = classifyPromoteGroup(rel);
  if (group === 'shared') return true;
  return allowlist.includes(group);
}

function buildModifiedAppend(changeId: string, syncedAt: string, body: string): string {
  const trimmed = body.replace(/\s+$/g, '');
  return (
    `\n\n---\n\n` +
    `## Delta — ${changeId} (${syncedAt})\n\n` +
    `- **kind**: MODIFIED\n\n` +
    trimmed +
    `\n`
  );
}

function formatDeltaLines(items: PromoteDelta[]): string {
  if (items.length === 0) return '- (none)';
  const byKind: Record<DeltaKind, string[]> = { ADDED: [], MODIFIED: [], REMOVED: [] };
  for (const d of items) {
    byKind[d.kind].push(`\`${d.path}\``);
  }
  const lines: string[] = [];
  for (const kind of ['ADDED', 'MODIFIED', 'REMOVED'] as DeltaKind[]) {
    if (byKind[kind].length === 0) continue;
    lines.push(`- ${kind}: ${byKind[kind].join(', ')}`);
  }
  return lines.join('\n') || '- (none)';
}

function buildGroupedHistoryBody(deltas: PromoteDelta[]): string {
  const groups = new Map<string, PromoteDelta[]>();
  for (const d of deltas) {
    const list = groups.get(d.slug) ?? [];
    list.push(d);
    groups.set(d.slug, list);
  }
  const keys = [...groups.keys()].sort((a, b) => {
    if (a === 'shared') return -1;
    if (b === 'shared') return 1;
    return a.localeCompare(b);
  });
  const parts: string[] = [];
  for (const key of keys) {
    const heading = key === 'shared' ? '### shared' : `### slug: ${key}`;
    parts.push(heading);
    parts.push(formatDeltaLines(groups.get(key) ?? []));
    parts.push('');
  }
  return parts.join('\n').trimEnd();
}

function appendHistoryEntry(
  historyPath: string,
  changeId: string,
  syncedAt: string,
  archiveRel: string,
  deltas: PromoteDelta[]
): void {
  mkdirSync(dirname(historyPath), { recursive: true });
  const header = existsSync(historyPath)
    ? readFileSync(historyPath, 'utf-8')
    : archiveAsset('revision-history.md').trimEnd() + '\n\n';
  const grouped = buildGroupedHistoryBody(deltas);
  const entry = archiveAsset('revision-history-entry.md')
    .replaceAll('{changeId}', changeId)
    .replaceAll('{syncedAt}', syncedAt)
    .replaceAll('{archiveRel}', archiveRel)
    .replaceAll('{deltaGroups}', grouped)
    .trimEnd();
  writeFileSync(historyPath, header + entry + '\n', 'utf-8');
}

function collectSourceRels(folder: string, allowlist?: string[]): string[] {
  return listFilesRecursive(folder)
    .map((r) => r.replace(/\\/g, '/'))
    .filter((rel) => !shouldSkipPromote(rel) && isUnderAllowlist(rel, allowlist));
}

function collectMasterRels(projectRoot: string, allowlist?: string[]): string[] {
  const master = join(projectRoot, MASTER_ROOT);
  return listFilesRecursive(master)
    .map((r) => r.replace(/\\/g, '/'))
    .filter((rel) => {
      if (rel.endsWith('revision-history.md')) return false;
      if (rel.endsWith('bc-revision-history.md')) return false;
      if (shouldSkipPromote(rel)) return false;
      return isUnderAllowlist(rel, allowlist);
    });
}

/**
 * Append-only promote into master. Never deletes existing master files.
 */
export function promoteChangeToMaster(
  projectRoot: string,
  changeId: string,
  syncedAt: string,
  sourceOrOptions: 'current' | 'archive' | PromoteOptions = 'archive',
  archiveFolderName?: string
): PromoteResult {
  const options: PromoteOptions =
    typeof sourceOrOptions === 'string'
      ? { source: sourceOrOptions, archiveFolderName }
      : sourceOrOptions;

  const source = options.source ?? 'archive';
  const folder =
    source === 'current'
      ? join(projectRoot, CHANGE_CURRENT, changeId)
      : join(
          projectRoot,
          CHANGE_ARCHIVE,
          options.archiveFolderName ?? archiveFolderName ?? `${syncedAt}-${changeId}`
        );

  if (!existsSync(folder)) {
    throw new Error(`Change folder not found: ${folder}`);
  }

  const allowlist = options.slugAllowlist;
  const sourceRels = collectSourceRels(folder, allowlist);
  const sourceSet = new Set(sourceRels);
  const masterRels = collectMasterRels(projectRoot, allowlist);

  const deltas: PromoteDelta[] = [];
  const promotedFiles: string[] = [];

  for (const rel of sourceRels) {
    const src = join(folder, rel);
    const dest = join(projectRoot, MASTER_ROOT, rel);
    const srcBody = readFileSync(src, 'utf-8');
    const group = classifyPromoteGroup(rel);

    if (!existsSync(dest)) {
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, srcBody.endsWith('\n') ? srcBody : `${srcBody}\n`, 'utf-8');
      deltas.push({ path: rel, kind: 'ADDED', slug: group });
      promotedFiles.push(rel);
      continue;
    }

    const masterBody = readFileSync(dest, 'utf-8');
    if (normalizeText(masterBody) === normalizeText(srcBody)) {
      continue;
    }

    writeFileSync(dest, masterBody.replace(/\s+$/g, '') + buildModifiedAppend(changeId, syncedAt, srcBody), 'utf-8');
    deltas.push({ path: rel, kind: 'MODIFIED', slug: group });
    promotedFiles.push(rel);
  }

  for (const rel of masterRels) {
    if (sourceSet.has(rel)) continue;
    const group = classifyPromoteGroup(rel);
    if (group === 'shared') {
      const sourceHasShared = sourceRels.some((r) => classifyPromoteGroup(r) === 'shared');
      if (!sourceHasShared) continue;
    } else {
      const sourceHasSlug = sourceRels.some((r) => classifyPromoteGroup(r) === group);
      if (!sourceHasSlug) continue;
    }
    deltas.push({ path: rel, kind: 'REMOVED', slug: group });
  }

  const archiveRel =
    source === 'current'
      ? `${CHANGE_CURRENT}/${changeId}/`
      : `${CHANGE_ARCHIVE}/${options.archiveFolderName ?? archiveFolderName ?? `${syncedAt}-${changeId}`}/`;

  // requirement history: requirement/** + shared non-architecture/design (e.g. project.md)
  const requirementHistoryDeltas = deltas.filter(
    (d) =>
      d.path.startsWith('requirement/') ||
      (d.slug === 'shared' &&
        !d.path.startsWith('architecture/') &&
        !d.path.startsWith('design/') &&
        !d.path.startsWith('requirement/'))
  );
  // design history: architecture/** + design/** (must group by slug)
  const designHistoryDeltas = deltas.filter(
    (d) => d.path.startsWith('architecture/') || d.path.startsWith('design/')
  );

  if (requirementHistoryDeltas.length > 0) {
    appendHistoryEntry(
      join(projectRoot, MASTER_REQUIREMENT_HISTORY),
      changeId,
      syncedAt,
      archiveRel,
      requirementHistoryDeltas
    );
  }
  if (designHistoryDeltas.length > 0) {
    appendHistoryEntry(
      join(projectRoot, MASTER_DESIGN_HISTORY),
      changeId,
      syncedAt,
      archiveRel,
      designHistoryDeltas
    );
  }

  return {
    promotedFiles,
    deltas,
    requirementHistoryAppended: requirementHistoryDeltas.length > 0,
    designHistoryAppended: designHistoryDeltas.length > 0,
  };
}

export function listCurrentChangeIds(projectRoot: string): string[] {
  const dir = join(projectRoot, CHANGE_CURRENT);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory();
  });
}
