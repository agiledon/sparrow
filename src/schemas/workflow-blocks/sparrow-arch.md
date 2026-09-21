## 执行顺序检查

- **本阶段**：sparrow-arch（第 2 步 / 共 8 步），产品级
- **前置**：`sparrow-state.json` 的 development-mode 非 `tbd`/`brownfield`；`change/current/{activeChangeId}/requirement/business/catalog.md` 与至少一份 `services/*.md` 必须存在，否则先 **sparrow-requirement**
- 已存在 `architecture/bounded-contexts.md`（或兼容旧路径 `application.md`）时按存在性检查与 `compat-migrate.md` 处理
