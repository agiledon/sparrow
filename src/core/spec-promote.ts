/**
 * Promote archived change specs into master/ and append revision-history entries.
 */

import {
  copyFileSync,
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


export interface PromoteResult {
  promotedFiles: string[];
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
      out.push(relative(base, full));
    }
  }
  return out;
}

function isRequirementDomain(rel: string): boolean {
  return rel.startsWith('requirement/');
}

function isDesignDomain(rel: string): boolean {
  return rel.startsWith('architecture/') || rel.startsWith('design/');
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

function appendHistory(
  historyPath: string,
  changeId: string,
  syncedAt: string,
  archiveRel: string,
  files: string[]
): void {
  mkdirSync(dirname(historyPath), { recursive: true });
  const header = existsSync(historyPath)
    ? readFileSync(historyPath, 'utf-8')
    : archiveAsset('revision-history.md').trimEnd() + '\n\n';
  const fileList = files.map((f) => `- \`${f}\``).join('\n') || '- (none)';
  const entry = archiveAsset('revision-history-entry.md')
    .replaceAll('{changeId}', changeId)
    .replaceAll('{syncedAt}', syncedAt)
    .replaceAll('{archiveRel}', archiveRel)
    .replaceAll('{fileList}', fileList)
    .trimEnd();
  writeFileSync(historyPath, header + entry + '\n', 'utf-8');
}

/**
 * Copy change tree into master (excluding plan.md under design/{slug}/).
 * Appends file lists to domain revision-history files.
 */
export function promoteChangeToMaster(
  projectRoot: string,
  changeId: string,
  syncedAt: string,
  source: 'current' | 'archive' = 'archive',
  archiveFolderName?: string
): PromoteResult {
  const folder =
    source === 'current'
      ? join(projectRoot, CHANGE_CURRENT, changeId)
      : join(projectRoot, CHANGE_ARCHIVE, archiveFolderName ?? `${syncedAt}-${changeId}`);

  if (!existsSync(folder)) {
    throw new Error(`Change folder not found: ${folder}`);
  }

  const promotedFiles: string[] = [];
  const reqFiles: string[] = [];
  const designFiles: string[] = [];

  for (const rel of listFilesRecursive(folder)) {
    if (shouldSkipPromote(rel.replace(/\\/g, '/'))) continue;
    const src = join(folder, rel);
    const dest = join(projectRoot, MASTER_ROOT, rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    promotedFiles.push(rel.replace(/\\/g, '/'));
    const norm = rel.replace(/\\/g, '/');
    if (isRequirementDomain(norm)) reqFiles.push(norm);
    if (isDesignDomain(norm)) designFiles.push(norm);
  }

  const archiveRel =
    source === 'current'
      ? `${CHANGE_CURRENT}/${changeId}/`
      : `${CHANGE_ARCHIVE}/${archiveFolderName ?? `${syncedAt}-${changeId}`}/`;

  appendHistory(
    join(projectRoot, MASTER_REQUIREMENT_HISTORY),
    changeId,
    syncedAt,
    archiveRel,
    reqFiles
  );
  appendHistory(join(projectRoot, MASTER_DESIGN_HISTORY), changeId, syncedAt, archiveRel, designFiles);

  return {
    promotedFiles,
    requirementHistoryAppended: reqFiles.length > 0,
    designHistoryAppended: designFiles.length > 0,
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
