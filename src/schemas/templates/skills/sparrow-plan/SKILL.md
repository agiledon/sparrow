# Sparrow Plan — 实现计划

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`：

- 后端：`assets/plan.md` → `design/{slug}/plan.md`
- 交互上下文：`assets/plan-interaction.md` → `design/{slug}/plan.md`

每个任务以 `## 任务` 开头，含执行方、可并行、checklist 步骤。不得改模板章节骨架。

## 步骤

1. 读 `references/ubiquitous-language.md`、`references/revise-gate.md`、`references/output-existence-check.md`。缺 spec/api/tech/model 则提示补齐。
2. 后端：读 `references/module-layouts.md`。任务顺序：脚手架 → 领域 → 基础设施（含迁移）→ 应用 → API → 集成测试。同一聚合的领域 TDD 写在同一步骤。
3. 交互上下文：读 `references/interaction-plan.md`。以页面/旅程为粒度；契约桩切换排在最后。
4. 不臆造 api.md / model.md 中不存在的 API 或聚合。
5. 读 `references/project-md-update.md`。

## 检查清单

- [ ] 执行方仅为 `dev` 或 `qa`；qa 不写领域单元测试
- [ ] 无按层拆分的构建子模块；无 `application/command` 目录
- [ ] 数据库任务由领域模型推导
- [ ] `project.md` 已更新

## 下一步

执行 **sparrow-apply @{slug}**，完成后 **sparrow-verify @{slug}**。

{{HARNESS}}
