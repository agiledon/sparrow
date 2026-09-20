# Sparrow Requirement — 需求探索与业务服务识别

## 完成标准

下列路径已按对应 `assets/` 模板写满必填块（相对 `docs/sparrow/change/current/{activeChangeId}/`）：

- `assets/proposal.md` → `proposal.md`（`development-mode` 抄自 `.sparrow/sparrow-state.json`）
- `assets/prd-business.md` → `requirement/business/prd-business.md`
- `assets/prd-quality.md` → `requirement/quality/prd-quality.md`
- 共享 `assets/project.md` → `project.md`（若不存在则创建）

有 UI 探索时另写：

- `assets/ui-spec.md` → `requirement/ui/ui-spec.md`
- `assets/design-tokens.md` → `requirement/ui/design-tokens.md`
- `assets/component-library.md` → `requirement/ui/components/component-library.md`
- `assets/prototype-index.html` → `requirement/ui/prototypes/index.html`（及页面 html）

不得改模板章节结构。未涉及的质量属性维度直接省略。

## 步骤

工作目录为**项目根**。脚本在本 skill 的 `scripts/` 下（例如 `.cursor/skills/sparrow-requirement/scripts/`）。

1. 读 `references/ubiquitous-language.md` 与 `references/spec-layout-guide.md`。运行 `scripts/sparrow-state.mjs show`。
2. 若 `development-mode` 为 `tbd`：运行 `scripts/sparrow-state.mjs detect-mode`，把输出的 `mode` 写入 `set-mode`。判定规则（脚本已实现）：archive 与 change 皆空且无源码 → `greenfield`；皆空且有源码 → `brownfield`；archive / change / master 已有规格 → `iteration`。
3. 若模式为 `brownfield`：告知用户 Sparrow 暂不支持棕地核心流程，**停止**。不创建 change 工作区，不 Grill Me。`pipeline` 保持为空。
4. `greenfield` 与 `iteration` 走同一套核心流程（iteration 仍按 revise / master diff）。收集本次需求分析输入：
   - 用户已给提示词或显式指定了要读的文件：以用户输入为准，不全局搜索。
   - 否则：在仓库内搜索文本/Markdown（文件名或路径含 `prd`、`srs`、`requirement`、`需求`、`规格`），**排除** `docs/sparrow/`。有候选则解读并请用户确认是否作为本次输入；没有则请用户给出原始需求或指定文档。无输入则停止。
5. 从项目根运行 `scripts/ensure-change-workspace.mjs --check`。若退出码 1：按 `requirement/requirements.md`「活动变更 ID 确认纪律」只确认 change-id；用户中止则停止且不创建子目录。确认后运行 `scripts/ensure-change-workspace.mjs --create {change-id}`，再按 `assets/proposal.md` 填写 `proposal.md`（development-mode 用配置值）。禁止向 `master/` 写入。运行 `scripts/sparrow-state.mjs set-step requirement ongoing`。
6. 读 `references/revise-gate.md`。无活动变更基线则走全量；有则对 master 需求做 ADDED / MODIFIED / REMOVED 增量，在 change 工作区更新，不写 version 元数据。
7. 读 `references/output-existence-check.md`，对本阶段已存在的 prd 文件做一次 skip / overwrite / update。
8. 阶段一 Grill Me：读 `references/grill-me.md`「需求探索」，遵守互动纪律，覆盖全部维度后输出快速总结。
9. 阶段二：读 `references/business-service-rules.md`，按 `assets/prd-business.md` 与 `assets/prd-quality.md` 写入文档。质量属性维度见模板注释。
10. 询问是否做 UI 探索。否：跳过。是：读 `references/grill-me.md`「UI 探索」，再按 UI 模板写入 `requirement/ui/`。本阶段页面不关联 BC。
11. 读 `references/project-md-update.md` 与 `references/version-metadata.md`，更新 change 工作区 `project.md`。运行 `scripts/sparrow-state.mjs set-step requirement done`。

## 检查清单

- [ ] `sparrow-state.json` 的 development-mode 已确定且非 brownfield
- [ ] change-id 已确认且工作区在 `change/current/{id}/`
- [ ] 需求维度均已确认并有快速总结
- [ ] 业务服务覆盖原始需求；一次请求一个服务；名称动宾
- [ ] 质量属性无空章节
- [ ] 若做了 UI：旅程闭环、无孤儿页面、原型有导航
- [ ] `project.md` 已更新；pipeline `requirement` 为 `done`

## 下一步

执行 **/sparrow-arch**。若有 UI 产出，arch 将同时生成 `architecture/frontend.md`。

{{PLUGIN:sparrow-ui}}
{{HARNESS}}
