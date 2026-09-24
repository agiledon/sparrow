# Sparrow Reconcile — 规格对账

辅助命令。vibe coding 或 bugfix 后，把**已存在**的规格与 harness 对齐到代码与对话决策。不新增流水线产出，不走 revise。

## 完成标准

- 仅原地更新已存在文件；跳过清单已输出
- 未改 `architecture/*.md`、未新建 slug、未改 `plan.md`
- 变更清单经用户确认后写入
- 规格未变但实现漂移时，更新项目级 harness，不改规格

若 `change/current/` 有未归档变更：提示架构级变更应走 revise；reconcile 不替代 revise。

## 按需加载

现在只读取 `steps/01-collect.md`，并只执行该文件。
禁止列举或预读步骤目录及其附属文件。
未进入的步骤、被跳过的分支，不得读取其文件。

## 步骤

1. 收集差异
2. 只加载已有目标
3. 分类
4. 区分规格与约束
5. 确认后写入
