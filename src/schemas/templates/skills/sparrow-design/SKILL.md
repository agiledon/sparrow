# Sparrow Design — API 契约与技术选型

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`：

后端 BC：

- `assets/api.md` → `design/{slug}/api.md`
- `assets/tech.md` → `design/{slug}/tech.md`

交互上下文：

- `assets/api-interaction.md` → `design/{slug}/api.md`
- `assets/tech-interaction.md` → `design/{slug}/tech.md`

并创建或更新 `assets/architecture-api.md` → `architecture/api.md`。不得改模板章节。

## 步骤

1. 读 `references/ubiquitous-language.md`、`references/revise-gate.md`、`references/output-existence-check.md`。
2. 未指定 slug 时从 `project.md` 列出并请用户选择。按是否标注 `— *交互上下文*` 分支。
3. 后端：读 `references/api-design-rules.md`。每次一问选择语言与技术栈，写入 tech.md。一个业务服务 = 一个序列图 = 一个 API；序列图只含 BC 与外部系统。
4. 交互上下文：读 `references/interaction-design.md`。不读取任何 BC 的 `api.md`。BFF 只聚合不写业务逻辑。
5. 按 `assets/architecture-api.md` 更新项目级 API 总目录（无则创建）。
6. 读 `references/project-md-update.md`，更新该 slug 的 api/tech 状态。

## 检查清单

- [ ] API 数量 = spec.md 业务服务数（后端）或与 UI 页面对应（交互上下文）
- [ ] 每个序列图中 actor 向当前上下文只发起一次请求
- [ ] 组件图 provided/required 与 API 一致
- [ ] `architecture/api.md` 已录入当前 slug
- [ ] 交互上下文未读取 BC api.md

## 下一步

执行 **sparrow-model @{slug}**。

{{PLUGIN:archify}}
{{HARNESS}}
