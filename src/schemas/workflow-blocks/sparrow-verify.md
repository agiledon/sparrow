## 执行顺序检查

- **本阶段**：sparrow-verify（第 7 步 / 共 8 步），团队级，按 slug
- **前置**：`sparrow-state.json` 非 `tbd`/`brownfield`；该 slug 已 apply（plan 全 `- [x]` 且 `code_review.md` 存在）
- 未指定 slug 时从 `project.md` 列出单个、多个或全部
