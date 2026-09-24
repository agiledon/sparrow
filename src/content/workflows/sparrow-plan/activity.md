# Sparrow Plan — 实现计划

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`，写入 `design/{slug}/plan.md`。

每个任务以 `## 任务` 开头，含执行方、可并行、checklist 步骤。不得改模板章节骨架。

## 按需加载

现在只读取 `steps/01-gate.md`，并只执行该文件。
禁止列举或预读步骤目录及其附属文件。
未进入的步骤、被跳过的分支，不得读取其文件。

## 步骤

1. 确认状态与 slug
2. 读取上下文并分支
3. 后端计划或交互计划
4. 对照已有契约
5. 更新项目向导
