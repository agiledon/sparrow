## 规格路径（master / change）

术语见 `references/ubiquitous-language.md`。

**活动变更 ID**：`.sparrow/sparrow-state.json` 的 `active-change.changeId`；若为空且 `change/current/` 仅有一个子目录，则用该目录名。新建变更须向用户确认 `{change-id}`（kebab-case；见 `requirement/requirements.md`「活动变更 ID 确认纪律」）。**确认前禁止**在 `change/current/` 下创建子目录；用户中止则 `current/` 保持为空。**首次 archive 前 master 保持为空目录**。产出写在 `change/current/{change-id}/`。

| 用途 | 路径 |
|------|------|
| 已发布基线（只读） | `docs/sparrow/master/` |
| 当前变更工作区（读写） | `docs/sparrow/change/current/{activeChangeId}/` |
| 归档 | `docs/sparrow/change/archive/YYYY-MM-DD-{changeId}/` |
| 需求修订历史 | `docs/sparrow/master/requirement/revision-history.md` |
| 设计/架构修订历史 | `docs/sparrow/master/design/revision-history.md` |
| BC 拓扑历史 | `docs/sparrow/master/architecture/bc-revision-history.md` |

工作区与 master 同构（含 `architecture/api.md`）：`project.md`、`requirement/business/`（`catalog.md`、`subdomains/`、`capabilities/`、`scenarios/`、`services/`）、`requirement/quality/`、`requirement/ui/`、`architecture/`（`bounded-contexts.md` 等）、`design/{slug}/`（**仅 change 含** `plan.md`）。`design/{slug}/spec.md` 为该 BC 业务服务薄投影 + Properties。

**change 下禁止** `<!-- version: ... -->`。**development-mode** 以 `.sparrow/sparrow-state.json` 为准（`tbd` \| `greenfield` \| `iteration` \| `brownfield`）；`proposal.md` 抄写该值。`tbd` 时 `pipeline` 必须为空。

旧路径 `prd-business.md`、`architecture/business.md`、`architecture/application.md` 须按 `compat-migrate.md` 迁移。`docs/sparrow/changes/` 旧布局须先迁移。
