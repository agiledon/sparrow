# Sparrow Apply — 按计划生成代码

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`：

- 按 `design/{slug}/plan.md` 将全部步骤标为 `- [x]`
- 写入 `design/{slug}/code_review.md`
- 更新 `project.md`

后端代码在 `backend/`；交互上下文在 `frontend/` 与 `edge/bff/`。代码本身不走文档模板。

## 按需加载

现在只读取 `steps/01-gate.md`，并只执行该文件。
禁止列举或预读步骤目录及其附属文件。
未进入的步骤、被跳过的分支，不得读取其文件。

## 步骤

1. 确认状态与 slug
2. 读取上下文
3. 执行规则
4. 可选交互实现
5. 代码评审
6. 更新项目向导
