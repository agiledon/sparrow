# 落盘业务服务与质量属性

读 `references/business-service-rules.md`。

- 沿 EBP 按场景合并写入 `requirement/business/{sd-slug}/{c-slug}/{s-slug}/business-services.md`（省略能力层时去掉 `{c-slug}/`）。块模板 `assets/service.md` 写入同一文件标题 `## BS-{id}`，路径 `requirement/business/{sd-slug}/{c-slug}/{s-slug}/business-services.md#BS-{id}`。文件模板 `assets/business-services.md`。验收用 EARS。
- 做 E2E 覆盖自检并更新 catalog。
- 按 `assets/quality.md` 写 `requirement/quality/quality.md`（仅涉及维度）。

下一步：读取 `steps/09-ui.md`。不要提前打开它，也不要打开 UI 模板。
