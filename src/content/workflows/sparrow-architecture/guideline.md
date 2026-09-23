## 执行顺序检查

- **本阶段**：sparrow-architecture（第 2 步 / 共 8 步），产品级
- **前置**：`sparrow-state.json` 的 development-mode 非 `tbd`/`brownfield`；`change/current/{activeChangeId}/requirement/business/catalog.md` 与至少一份 `business-services.md` 必须存在，否则先 **sparrow-requirement**
- 已存在 `architecture/bounded-contexts.md` 时按 `references/output-existence-check.md` 处理
