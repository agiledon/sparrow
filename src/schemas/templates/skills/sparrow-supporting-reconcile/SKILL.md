# Sparrow Reconcile — 规格对账

辅助命令。vibe coding 或 bugfix 后，把**已存在**的规格与 harness 对齐到代码与对话决策。不新增流水线产出，不走 revise。

## 完成标准

- 仅原地更新已存在文件；跳过清单已输出
- 未改 `architecture/*.md`、未新建 slug、未改 `plan.md`
- 变更清单经用户确认后写入
- 规格未变但实现漂移时，更新项目级 harness，不改规格

## 步骤

1. 读 `references/ubiquitous-language.md`。收集对话历史与 `git diff` / 相关实现。
2. 读 change 工作区 `project.md`，只加载已存在的目标文件；输出已加载 / 已跳过。
3. 分类：业务需求 → `requirement/business/`（catalog / services 等）；技术/NFR → api/tech/prd-quality；领域模型 → model.md；UI → `requirement/ui/**`；实现纪律 → harness。
4. 规格 vs 约束：功能/接口/页面变化改规格；「必须/禁止」改 harness。各类规格未变而实现相对清晰规格漂移 → 约束缺口，补项目级 Must。
5. 输出变更清单，确认后再写。读 `references/version-metadata.md` 与 `references/project-md-update.md`（只改时间戳与已改文档状态，不改 BC 列表）。

若 `change/current/` 有未归档变更：提示架构级变更应走 revise；reconcile 不替代 revise。

{{HARNESS}}
