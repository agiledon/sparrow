## 规格路径（master / change）

**活动变更 ID**：\`.sparrow/active-change.json\` 的 \`changeId\`；若为空且 \`change/current/\` 仅有一个子目录，则使用该目录名。新建变更时须向用户确认 \`{change-id}\`：给出 1～3 个建议 kebab-case 名称，并允许自定义（详见 \`requirement/requirements.md\`「活动变更 ID 确认纪律」）。

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

---