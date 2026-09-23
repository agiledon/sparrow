# Sparrow Apply — 按计划生成代码

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`：

- 按 `design/{slug}/plan.md` 将全部步骤标为 `- [x]`
- `assets/code_review.md` → `design/{slug}/code_review.md`
- 更新 `project.md`

后端代码在 `backend/`；交互上下文在 `frontend/` 与 `edge/bff/`。代码本身不走文档模板。

## 步骤

1. 运行本 skill 的 `scripts/sparrow-state.mjs show`。`tbd` 则先 **sparrow-requirement**；`brownfield` 则停止。确定 slug 后 `set-context {slug} apply ongoing`。无 `plan.md` 则先 **sparrow-plan @{slug}**。plan 已全 `[x]` 则提示 **sparrow-verify @{slug}**。
2. 读 `references/ubiquitous-language.md`、`references/revise-gate.md`。
3. 读 `references/apply-rules.md`：按任务执行方执行；领域层 TDD 同一步骤内完成；遵守 harness `apply/implementation.md`。
4. 交互上下文：读 `references/interaction-apply.md`，并读取 `requirement/ui/` 规格与原型。
5. revise 且档位 S4：按 apply-rules 中的代码动作映射执行，校验边界后再更新 code_review。
6. 全部任务完成后按 `assets/code_review.md` 写评审报告。
7. 读 `references/project-md-update.md`。运行 `scripts/sparrow-state.mjs set-context {slug} apply done`。
