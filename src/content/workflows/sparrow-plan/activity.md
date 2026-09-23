# Sparrow Plan — 实现计划

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`：

- 后端：`assets/plan.md` → `design/{slug}/plan.md`
- 交互上下文：`assets/plan-interaction.md` → `design/{slug}/plan.md`

每个任务以 `## 任务` 开头，含执行方、可并行、checklist 步骤。不得改模板章节骨架。

## 步骤

1. 运行本 skill 的 `scripts/sparrow-state.mjs show`。`tbd` 则先 **sparrow-requirement**；`brownfield` 则停止。确定 slug 后 `set-context {slug} plan ongoing`。缺 spec/api/tech/model 则提示补齐。
2. 读 `references/ubiquitous-language.md`、`references/revise-gate.md`、`references/output-existence-check.md`。
3. 后端：读 `references/module-layouts.md`。任务顺序：脚手架 → 领域 → 基础设施（含迁移）→ 应用 → API → 集成测试。同一聚合的领域 TDD 写在同一步骤。
4. 交互上下文：读 `references/interaction-plan.md`。以页面/旅程为粒度；契约桩切换排在最后。
5. 不臆造 api.md / model.md 中不存在的 API 或聚合。
6. 读 `references/project-md-update.md`。运行 `scripts/sparrow-state.mjs set-context {slug} plan done`。
