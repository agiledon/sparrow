# Sparrow Arch — 限界上下文与规格切片

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`，写满必填块：

- `architecture/bounded-contexts.md`（含 SD→BC 一对一映射表，再记调整）
- 每个后端 BC：`design/{slug}/spec.md`（薄投影 + Properties）

有 UI 时另写 `architecture/frontend.md` 与 `design/{ui-slug}/spec.md`。无 UI 则不写这两份。

更新 `project.md` 的 BC / 交互上下文索引。不得改模板章节结构。正文语言遵循 harness `common/always/document-language.md`。

## 按需加载

现在只读取 `steps/01-gate.md`，并只执行该文件。
禁止列举或预读步骤目录及其附属文件。
未进入的步骤、被跳过的分支，不得读取其文件。

## 步骤

1. 确认状态
2. 核对规格布局
3. 检查已有产出
4. 映射限界上下文
5. 切片 spec
6. 可选前端架构
7. 可选修订档位
8. 更新项目向导
