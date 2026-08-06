/**
 * Harness registry — aggregates all constraint asset templates.
 *
 * Each harness file is a markdown document that defines the "must do / must not do"
 * discipline for a DDD stage. Files are written to the global config directory
 * (~/.config/sparrow/harness) and copied as project placeholders
 * (docs/sparrow/harness) during init.
 */

import { CONSTITUTION_BODY } from './constitution.js';
import { EXPLORE_REQUIREMENTS_BODY } from './explore-requirements.js';
import { ARCH_BUSINESS_BODY } from './arch-business.js';
import { ARCH_APPLICATION_BODY } from './arch-application.js';
import { DESIGN_API_BODY } from './design-api.js';
import { MODEL_ARCHITECTURE_BODY } from './model-architecture.js';
import { MODEL_DOMAIN_BODY } from './model-domain.js';
import { APPLY_IMPLEMENTATION_BODY } from './apply-implementation.js';

/**
 * Harness asset version. Bump when constraint content changes so that
 * `sparrow update` can sync managed template files.
 */
export const HARNESS_VERSION = '1.0.0';

/**
 * Marker embedded at the top of managed (tool-written) template files.
 * Files that still carry this marker can be safely overwritten on upgrade;
 * files edited by the user lose the marker and are never clobbered.
 */
export const HARNESS_MANAGED_MARKER = 'sparrow-harness: managed';

export interface HarnessFile {
  /** Relative path within the harness directory, e.g. 'arch/application.md' */
  relPath: string;
  /** Human-readable title used for placeholder generation */
  title: string;
  /** Full markdown body */
  body: string;
}

export const HARNESS_FILES: HarnessFile[] = [
  { relPath: 'constitution.md', title: '约束资产宪法', body: CONSTITUTION_BODY },
  { relPath: 'explore/requirements.md', title: '需求探索约束', body: EXPLORE_REQUIREMENTS_BODY },
  { relPath: 'arch/business.md', title: '业务架构约束', body: ARCH_BUSINESS_BODY },
  { relPath: 'arch/application.md', title: '应用架构约束', body: ARCH_APPLICATION_BODY },
  { relPath: 'design/api-design.md', title: 'API 设计约束', body: DESIGN_API_BODY },
  { relPath: 'model/architecture.md', title: '领域建模架构约束', body: MODEL_ARCHITECTURE_BODY },
  { relPath: 'model/domain-modeling.md', title: '领域建模约束', body: MODEL_DOMAIN_BODY },
  { relPath: 'apply/implementation.md', title: '代码实现约束', body: APPLY_IMPLEMENTATION_BODY },
];

/**
 * Get all harness files.
 */
export function getHarnessFiles(): HarnessFile[] {
  return HARNESS_FILES;
}
