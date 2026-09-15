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

/** Embedded in core skill templates for agents. */
export const SPEC_LAYOUT_GUIDE = `## 规格路径（master / change）

**活动变更 ID**：\`.sparrow/active-change.json\` 的 \`changeId\`；若为空且 \`change/current/\` 仅有一个子目录，则使用该目录名。

| 用途 | 路径 |
|------|------|
| 已发布基线（只读） | \`docs/sparrow/master/\` |
| 当前变更工作区（读写） | \`docs/sparrow/change/current/{activeChangeId}/\` |
| 归档 | \`docs/sparrow/change/archive/YYYY-MM-DD-{changeId}/\` |
| 需求修订历史 | \`docs/sparrow/master/requirement/revision-history.md\` |
| 设计/架构修订历史 | \`docs/sparrow/master/design/revision-history.md\` |
| BC 拓扑历史 | \`docs/sparrow/master/architecture/bc-revision-history.md\` |

工作区与 master 同构（含 \`architecture/api.md\` 项目级 API 总目录）：\`project.md\`、\`requirement/business/\`、\`requirement/quality/\`、\`requirement/ui/\`、\`architecture/\`、\`design/{slug}/\`（**仅 change 含** \`plan.md\`）。\`spec.md\` 为该 BC 业务需求规格。

**change 下禁止** \`<!-- version: ... -->\`。**development-mode**（\`proposal.md\`）：\`greenfield\` | \`iteration\` | \`brownfield\`。

旧路径 \`docs/sparrow/requirement/prd-business.md\` 或 \`docs/sparrow/changes/\` 须先迁移。

---`;
