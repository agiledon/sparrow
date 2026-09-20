## 执行顺序检查

- **本阶段**：sparrow-plan（第 5 步 / 共 8 步），团队级，按 slug
- **前置**：`sparrow-state.json` 非 `tbd`/`brownfield`；`design/{slug}/spec.md`、`api.md`、`tech.md`、`model.md`
- 未指定 slug 时从 `project.md` 列出。按是否标注「交互上下文」分支
