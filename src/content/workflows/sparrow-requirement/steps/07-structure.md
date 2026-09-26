# 落盘子领域（Subdomain）结构

读 `references/subdomain-rules.md`。按左侧已命名的业务服务数量选择一层结构，不要同时写两套。

未达问题空间复杂度阈值（Problem-space Complexity Threshold，见 harness `requirement/requirements.md`），只写两层：

- `assets/catalog.md` → `requirement/business/catalog.md`（价值流（Value Stream）、结构索引里能力与场景写「省略」、端到端业务流程表）
- `assets/subdomain.md` → `requirement/business/{sd-slug}/subdomain.md`（链到本目录的 `business-services.md`，不写能力与场景节）
- 不打开 `assets/capability.md` 与 `assets/scenario.md`，不建 `{c-slug}/` 与 `{s-slug}/`

达到问题空间复杂度阈值，写四层：

- `assets/catalog.md` → `requirement/business/catalog.md`（用四层结构索引表）
- `assets/subdomain.md` → `requirement/business/{sd-slug}/subdomain.md`（只链能力）
- `assets/capability.md` → `requirement/business/{sd-slug}/{c-slug}/capability.md`
- `assets/scenario.md` → `requirement/business/{sd-slug}/{c-slug}/{s-slug}/scenario.md`

下一步：读取 `steps/08-services.md`。不要提前打开它。
