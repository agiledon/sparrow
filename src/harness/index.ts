/**
 * Harness registry — aggregates bundled constraint asset templates.
 */

import { bundledHarnessBodies } from '../schemas/bundled-content.js';

export const HARNESS_VERSION = '1.0.16';

export const HARNESS_MANAGED_MARKER = 'sparrow-harness: managed';

export interface HarnessFile {
  relPath: string;
  title: string;
  body: string;
}

export const HARNESS_FILES: HarnessFile[] = Object.entries(bundledHarnessBodies).map(
  ([relPath, { title, body }]) => ({ relPath, title, body })
);

export function getHarnessFiles(): HarnessFile[] {
  return HARNESS_FILES;
}
