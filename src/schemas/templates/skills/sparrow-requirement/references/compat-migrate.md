# 兼容与迁移（prd-business / 扁平四目录 / architecture 旧路径）

新 change **必须**使用嵌套问题空间树与 `architecture/bounded-contexts.md`。下列路径仅用于 iteration 迁移或只读兼容。

## 已弃用路径

| 旧路径 | 新路径 |
|--------|--------|
| `requirement/business/prd-business.md` | `catalog.md` + `{sd-slug}/subdomain.md` + 可选 `{c-slug}/capability.md` + `{s-slug}/scenario.md` + `{s-slug}/business-services.md` |
| `requirement/business/subdomains/{sd}.md` | `requirement/business/{sd-slug}/subdomain.md` |
| `requirement/business/capabilities/{c}.md` | `requirement/business/{sd-slug}/{c-slug}/capability.md`（未达阈值则省略） |
| `requirement/business/scenarios/{s}.md` | `requirement/business/{sd-slug}/[ {c-slug}/ ]{s-slug}/scenario.md` |
| `requirement/business/services/{BS-id}.md` | 同场景合并为 `{s-slug}/business-services.md#BS-{id}` |
| `architecture/business.md` | 子领域内容已在 `{sd-slug}/subdomain.md` + catalog（arch 不再产出） |
| `architecture/application.md` | `architecture/bounded-contexts.md` |
| harness `arch/business.md` | `requirement/subdomains.md` |
| harness `arch/application.md` | `arch/bounded-contexts.md` |
| `requirement/quality/prd-quality.md` | `requirement/quality/quality.md` |

## Iteration 迁移步骤

1. 若 change 或 master 仍有 `prd-business.md`：按章节拆到对应场景的 `business-services.md`（`## BS-*` 块），补 SD/C/S 追溯与 EARS；建 `catalog.md`（含嵌套链接）与 EBP 表。
2. 若仍有扁平 `subdomains/` · `capabilities/` · `scenarios/` · `services/`：按 catalog 中的 SD/C/S 归属搬进嵌套目录；同场景多个 `services/BS-*.md` 合并为一个 `business-services.md`；更新 `project.md` §1.1 使只链 catalog。
3. 若仍有 `architecture/business.md`：将子领域定义迁入 `{sd-slug}/subdomain.md`（若 requirement 尚无），然后删除或标注 deprecated，**不要**在 arch 再生成。
4. 若仍有 `architecture/application.md`：重命名/改写为 `bounded-contexts.md`，补上 **SD→BC 一对一映射表**（再写调整理由）；更新 `project.md` 链接。
5. 各 `design/{slug}/spec.md`：改为薄投影 + Properties（从 EARS 抽取）；`source` 指向 `…/business-services.md#BS-{id}`。
6. 下游引用以新路径为准；发现旧路径时先迁移再继续。

## 检测提示

- 存在 `prd-business.md` 且不存在 `catalog.md` → 视为未迁移，requirement update 优先拆分。
- 存在扁平 `requirement/business/services/` 且不存在任何 `business-services.md` → requirement update 优先合并到嵌套树。
- 存在 `application.md` 且不存在 `bounded-contexts.md` → arch update 优先迁移。
