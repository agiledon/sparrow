/**
 * Archive skill assets needed at promote time (kept separate from full bundled-content
 * so agent scripts can bundle a small promote CLI).
 */

import revisionHistoryMd from '../../content/workflows/sparrow-archive/assets/revision-history.md';
import revisionHistoryEntryMd from '../../content/workflows/sparrow-archive/assets/revision-history-entry.md';

const ASSETS: Record<string, string> = {
  'revision-history.md': revisionHistoryMd,
  'revision-history-entry.md': revisionHistoryEntryMd,
};

export function archivePromoteAsset(name: string): string {
  const body = ASSETS[name];
  if (!body) {
    throw new Error(`Missing archive promote asset: ${name}`);
  }
  return body;
}
