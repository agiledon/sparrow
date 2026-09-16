## 执行顺序检查

- **本阶段**：sparrow-apply（第 6 步 / 共 8 步），团队级，按 slug
- **前置**：`design/{slug}/plan.md`；缺则先 **sparrow-plan @{slug}**
- plan 已全 `- [x]` 时提示 **sparrow-verify @{slug}**
- 按是否标注「交互上下文」分支
