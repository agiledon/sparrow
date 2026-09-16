/**
 * Master / change spec layout paths (relative to project root).
 */

export const SPARROW_DOCS = 'docs/sparrow';
export const SPARROW_DIR = '.sparrow';
export const ACTIVE_CHANGE_FILE = `${SPARROW_DIR}/active-change.json`;

export const MASTER_ROOT = `${SPARROW_DOCS}/master`;
export const CHANGE_ROOT = `${SPARROW_DOCS}/change`;
export const CHANGE_CURRENT = `${CHANGE_ROOT}/current`;
export const CHANGE_ARCHIVE = `${CHANGE_ROOT}/archive`;

export const MASTER_PROJECT_MD = `${MASTER_ROOT}/project.md`;
export const MASTER_REQUIREMENT_HISTORY = `${MASTER_ROOT}/requirement/revision-history.md`;
export const MASTER_DESIGN_HISTORY = `${MASTER_ROOT}/design/revision-history.md`;
export const MASTER_BC_HISTORY = `${MASTER_ROOT}/architecture/bc-revision-history.md`;

/** @deprecated Legacy flat layout */
export const LEGACY_CHANGES_ROOT = `${SPARROW_DOCS}/changes`;

export const PRD_BUSINESS_REL = 'requirement/business/prd-business.md';
export const PRD_QUALITY_REL = 'requirement/quality/prd-quality.md';
export const ARCHITECTURE_API_CATALOG_REL = 'architecture/api.md';
