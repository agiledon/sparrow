# 兼容与迁移（prd-business / architecture 旧路径）

新 change **必须**使用分层问题空间与 `architecture/bounded-contexts.md`。下列路径仅用于 iteration 迁移或只读兼容。

## 已弃用路径

| 旧路径 | 新路径 |
|--------|--------|
| `requirement/business/prd-business.md` | `catalog.md` + `subdomains/` + `capabilities/` + `scenarios/` + `services/{BS-id}.md` |
| `architecture/business.md` | 子领域内容已在 `requirement/business/subdomains/` + catalog（arch 不再产出） |
| `architecture/application.md` | `architecture/bounded-contexts.md` |
| harness `arch/business.md` | `requirement/subdomains.md` |
| harness `arch/application.md` | `arch/bounded-contexts.md` |

## Iteration 迁移步骤

1. 若 change 或 master 仍有 `prd-business.md`：按章节拆成 `services/BS-*.md`，补 SD/C/S 追溯与 EARS（旧「验收标准」改写为 EARS）；建 `catalog.md` 与 EBP 表。
2. 若仍有 `architecture/business.md`：将子领域定义迁入 `requirement/business/subdomains/`（若 requirement 尚无），然后删除或标注 deprecated，**不要**在 arch 再生成。
3. 若仍有 `architecture/application.md`：重命名/改写为 `bounded-contexts.md`，补上 **SD→BC 一对一映射表**（再写调整理由）；更新 `project.md` 链接。
4. 各 `design/{slug}/spec.md`：改为薄投影 + Properties（从 EARS 抽取）；`source` 指向新 services 路径。
5. 下游引用（design/api-design-rules、reconcile 等）以新路径为准；发现旧路径时先迁移再继续。

## 检测提示

- 存在 `prd-business.md` 且不存在 `catalog.md` → 视为未迁移，requirement update 优先拆分。
- 存在 `application.md` 且不存在 `bounded-contexts.md` → arch update 优先迁移。
