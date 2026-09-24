# Sparrow Verify — 规格与代码对照

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`：

- 写入 `design/{slug}/verify_report.md`，问题按 P0–P3 分级并给出建议
- 更新 `project.md`

## 按需加载

现在只读取 `steps/01-gate.md`，并只执行该文件。
禁止列举或预读步骤目录及其附属文件。
未进入的步骤、被跳过的分支，不得读取其文件。

## 步骤

1. 确认状态与 slug
2. 读取术语
3. 检查是否已实现
4. 对照规格与代码
5. 写入报告
6. 更新项目向导

## 下一步

- 存在 P0 或 P1：列出阻塞项，不提示 archive；修复后重新 verify。
- 无 P0/P1：该 slug 通过。全部相关 slug 通过后，revise 模式执行 **sparrow-archive**。
