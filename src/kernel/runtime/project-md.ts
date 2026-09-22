/**
 * project.md wizard file generation and management.
 *
 * project.md lives at docs/sparrow/change/current/{change-id}/project.md (change 工作区向导)
 * and, after archive promote, at docs/sparrow/master/project.md (基线索引).
 * The change-workspace copy is created by the requirement skill after the user
 * confirms a change-id — not by `sparrow init`.
 */

export interface ProjectMdSection {
  title: string;
  entries: { label: string; path: string; status: 'pending' | 'generated'; version?: string }[];
}

import { ARCHITECTURE_API_CATALOG_REL } from './spec-paths.js';
import { sharedAssets } from '../../schemas/bundled-content.js';

/** Canonical path to the quality-attribute document (relative to master/ or change workspace root). */
export const API_CATALOG_PATH = ARCHITECTURE_API_CATALOG_REL;
export const QUALITY_PATH = 'requirement/quality/quality.md';
/** @deprecated Use QUALITY_PATH */
export const PRD_QUALITY_PATH = QUALITY_PATH;

/**
 * Generate project.md content for a change workspace (or promoted master copy).
 */
export function generateProjectMdContent(
  projectName: string,
  sparrowVersion: string,
  toolIds: string[]
): string {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const toolList = toolIds.join(', ');
  const tpl = sharedAssets['project.md'];
  if (!tpl) {
    throw new Error('Missing shared asset project.md');
  }
  return tpl
    .replaceAll('{projectName}', projectName)
    .replaceAll('{sparrowVersion}', sparrowVersion)
    .replaceAll('{toolList}', toolList)
    .replaceAll('{now}', now);
}
