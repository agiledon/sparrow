# Sparrow Requirement — 需求探索与业务服务识别

## 完成标准

下列路径已按对应 `assets/` 模板写满必填块（相对 `docs/sparrow/change/current/{activeChangeId}/`）：

- `assets/proposal.md` → `proposal.md`
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

1. 读 `references/ubiquitous-language.md` 与 `references/spec-layout-guide.md`。
2. 从项目根运行 `scripts/ensure-change-workspace.mjs --check`。若退出码 1：按 `requirement/requirements.md`「活动变更 ID 确认纪律」只确认 change-id；用户中止则停止且不创建子目录。确认后运行 `scripts/ensure-change-workspace.mjs --create {change-id}`，再按 `assets/proposal.md` 填写 `proposal.md`。禁止向 `master/` 写入。
3. 读 `references/revise-gate.md`。无活动变更基线则走全量；有则对 master 需求做 ADDED / MODIFIED / REMOVED 增量，在 change 工作区更新，不写 version 元数据。
4. 读 `references/output-existence-check.md`，对本阶段已存在的 prd 文件做一次 skip / overwrite / update。
5. 阶段一 Grill Me：读 `references/grill-me.md`「需求探索」，遵守互动纪律，覆盖全部维度后输出快速总结。
6. 阶段二：读 `references/business-service-rules.md`，按 `assets/prd-business.md` 与 `assets/prd-quality.md` 写入文档。质量属性维度见模板注释。
7. 询问是否做 UI 探索。否：跳过。是：读 `references/grill-me.md`「UI 探索」，再按 UI 模板写入 `requirement/ui/`。本阶段页面不关联 BC。
8. 读 `references/project-md-update.md` 与 `references/version-metadata.md`，更新 change 工作区 `project.md`。

## 检查清单

- [ ] change-id 已确认且工作区在 `change/current/{id}/`
- [ ] 需求维度均已确认并有快速总结
- [ ] 业务服务覆盖原始需求；一次请求一个服务；名称动宾
- [ ] 质量属性无空章节
- [ ] 若做了 UI：旅程闭环、无孤儿页面、原型有导航
- [ ] `project.md` 已更新

## 下一步

执行 **/sparrow-arch**。若有 UI 产出，arch 将同时生成 `architecture/frontend.md`。

{{PLUGIN:sparrow-ui}}
{{HARNESS}}
