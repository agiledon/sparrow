# Sparrow Requirement — 分层需求与业务服务识别

## 完成标准

下列路径已写满必填块（相对 `docs/sparrow/change/current/{activeChangeId}/`）：

- `proposal.md`（`development-mode` 抄自 `.sparrow/sparrow-state.json`）
- `requirement/business/catalog.md`（含 EBP→BS 表与嵌套链接）
- `requirement/business/{sd-slug}/subdomain.md`
- `requirement/business/{sd-slug}/{c-slug}/{s-slug}/scenario.md`（省略能力层时去掉 `{c-slug}/`）
- `requirement/business/{sd-slug}/{c-slug}/{s-slug}/business-services.md`（本场景全部 BS 合并于此）
- `requirement/quality/quality.md`
- `project.md`（change-id 确认时已生成；本阶段结束时更新勾选；§1.2 只链 catalog）

能力超过阈值时另写 `{c-slug}/capability.md`。未达阈值则省略能力层（不建 `{c-slug}/`）。

有 UI 探索时另写 `requirement/ui/` 下的规格、设计令牌、组件库与原型。未做 UI 则这些文件不存在。

不得改模板章节结构。未涉及的质量属性维度直接省略。正文语言遵循 harness `common/always/document-language.md`（`sparrow-config.json` 的 `lang`）。

## 按需加载

现在只读取 `steps/01-mode.md`，并只执行该文件。
禁止列举或预读步骤目录及其附属文件。
未进入的步骤、被跳过的分支，不得读取其文件。

## 步骤

1. 确认模式
2. 收集需求输入
3. 确认 change-id 并创建工作区
4. 判断是否增量修订
5. 检查已有产出
6. Grill Me 需求探索
7. 落盘子领域结构
8. 落盘业务服务与质量属性
9. 可选 UI 探索
10. 更新项目向导
