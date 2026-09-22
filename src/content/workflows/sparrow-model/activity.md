# Sparrow Model — 领域模型

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`：

- 后端：`assets/model.md` → `design/{slug}/model.md`
- 交互上下文：`assets/model-interaction.md` → `design/{slug}/model.md`（仍为单文件 `model.md`，不拆 view-model.md）

不得改模板章节。

## 步骤

1. 运行本 skill 的 `scripts/sparrow-state.mjs show`。`tbd` 则先 **sparrow-requirement**；`brownfield` 则停止。确定 slug 后 `set-context {slug} model ongoing`。缺 api.md/tech.md 则先 **sparrow-design @{slug}**。
2. 读 `references/ubiquitous-language.md`、`references/revise-gate.md`、`references/output-existence-check.md`。
3. 后端：读 `references/domain-modeling-steps.md` 与 harness `model/*`，按三阶段写入 `assets/model.md`。命名 UML 风格（PascalCase 类、camelCase 方法）。
4. 交互上下文：读 `references/view-modeling.md`。ViewModel ≠ 领域模型；不读任何 BC 的 model.md。
5. 读 `references/project-md-update.md`，更新该 slug 的 model 状态。运行 `scripts/sparrow-state.mjs set-context {slug} model done`。

## 检查清单

- [ ] 每个 api.md API 都有任务树入口（后端）或每个页面有 ViewModel（交互上下文）
- [ ] 类图与序列图操作一致；无裸 getter/setter；聚合间仅 ID 引用
- [ ] `project.md` 已更新

## 下一步

执行 **sparrow-plan @{slug}**。

{{PLUGIN:archify}}
{{HARNESS}}
