/**
 * Master / change spec layout paths (relative to project root).
 */

export const SPARROW_DOCS = 'docs/sparrow';
export const SPARROW_DIR = '.sparrow';
export const CONFIG_FILE = `${SPARROW_DIR}/sparrow-config.json`;
export const LEGACY_CONFIG_FILE = `${SPARROW_DIR}/sparrow.json`;
export const STATE_FILE = `${SPARROW_DIR}/sparrow-state.json`;
export const LEGACY_ACTIVE_CHANGE_FILE = `${SPARROW_DIR}/active-change.json`;

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

export const CATALOG_REL = 'requirement/business/catalog.md';
/** @deprecated Use catalog + services/; kept for migration detection */
export const PRD_BUSINESS_REL = 'requirement/business/prd-business.md';
export const BOUNDED_CONTEXTS_REL = 'architecture/bounded-contexts.md';
/** @deprecated Use bounded-contexts.md */
export const APPLICATION_ARCH_REL = 'architecture/application.md';
export const QUALITY_REL = 'requirement/quality/quality.md';
/** @deprecated Use QUALITY_REL */
export const PRD_QUALITY_REL = QUALITY_REL;
export const ARCHITECTURE_API_CATALOG_REL = 'architecture/api.md';
