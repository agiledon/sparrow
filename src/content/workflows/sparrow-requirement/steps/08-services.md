# 落盘业务服务（Business Service）与质量属性

读 `references/business-service-rules.md`。

- 未达问题空间复杂度阈值（见 harness `requirement/requirements.md`）：合并写入 `requirement/business/{sd-slug}/business-services.md`。追溯回填 `SD-*` 与端到端业务流程步骤；能力与场景写「省略」。
- 达到问题空间复杂度阈值：按场景合并写入 `requirement/business/{sd-slug}/{c-slug}/{s-slug}/business-services.md`。追溯回填 `SD-*` / `C-*` / `S-*` 与端到端业务流程步骤。
- 块模板 `assets/service.md` 写入同一文件标题 `## BS-{id}`。未达阈值时路径为 `requirement/business/{sd-slug}/business-services.md#BS-{id}`；达到阈值时路径为 `requirement/business/{sd-slug}/{c-slug}/{s-slug}/business-services.md#BS-{id}`。文件模板 `assets/business-services.md`。验收用中文句式。
- 做覆盖自检并更新 catalog。
- 按 `assets/quality.md` 写 `requirement/quality/quality.md`（仅涉及维度）。

下一步：读取 `steps/09-ui.md`。不要提前打开它，也不要打开 UI 模板。
