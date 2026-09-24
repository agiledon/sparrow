# Sparrow Model — 领域模型

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`：

- 后端或交互上下文都写入 `design/{slug}/model.md`（交互上下文仍为单文件，不拆 view-model）

不得改模板章节。

## 按需加载

现在只读取 `steps/01-gate.md`，并只执行该文件。
禁止列举或预读步骤目录及其附属文件。
未进入的步骤、被跳过的分支，不得读取其文件。

## 步骤

1. 确认状态与 slug
2. 读取上下文并分支
3. 后端模型或视图模型
4. 更新项目向导
