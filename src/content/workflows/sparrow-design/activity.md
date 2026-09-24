# Sparrow Design — API 契约与技术选型

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`：

- 后端 BC：`design/{slug}/api.md`、`design/{slug}/tech.md`
- 交互上下文：同样落入 `design/{slug}/api.md` 与 `design/{slug}/tech.md`
- 创建或更新 `architecture/api.md`

不得改模板章节。

## 按需加载

现在只读取 `steps/01-gate.md`，并只执行该文件。
禁止列举或预读步骤目录及其附属文件。
未进入的步骤、被跳过的分支，不得读取其文件。

## 步骤

1. 确认状态与 slug
2. 读取上下文并分支
3. 后端契约或交互契约
4. 更新 API 总目录
5. 更新项目向导
