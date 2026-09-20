# Sparrow Arch — 业务架构与应用架构定义

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`，按模板写满必填块：

- `assets/business.md` → `architecture/business.md`
- `assets/application.md` → `architecture/application.md`
- 每个后端 BC：`assets/spec.md` → `design/{slug}/spec.md`

有 UI 时：

- `assets/frontend.md` → `architecture/frontend.md`
- `assets/spec-interaction.md` → `design/{ui-slug}/spec.md`

更新 `project.md` 的 BC / 交互上下文索引。不得改模板章节结构。

## 步骤

1. 运行本 skill 的 `scripts/sparrow-state.mjs show`。`development-mode` 为 `tbd` 则先 **sparrow-requirement**；为 `brownfield` 则停止（暂不支持）。通过后 `set-step arch ongoing`。
2. 读 `references/ubiquitous-language.md`、`references/spec-layout-guide.md`、`references/revise-gate.md`。
3. 读 `references/output-existence-check.md`，对 business.md / application.md / 已有 spec.md 做一次 skip / overwrite / update。
4. 阶段一：读 `references/business-architecture.md`，按 `assets/business.md` 写入业务架构。
5. 阶段二：读 `references/react-mapping.md`，按 ReAct 完成迭代后再按 `assets/application.md` 写入。映射模式与 BC 命名遵守 harness `arch/application.md`。
6. 为每个 BC 创建 `design/{slug}/`，按映射把 `prd-business.md` 服务切片写入 `assets/spec.md`。
7. 若 `requirement/ui/` 存在：读 `references/frontend-architecture.md`，按 frontend / spec-interaction 模板写入。否则按该文件询问是否补 UI。
8. revise 时读 `references/bc-tiers.md`，按档位落实 diff；破坏性操作（删除/合并 BC、绞杀者 cutover）须用户确认。
9. 读 `references/project-md-update.md`：为每个 slug 添加 spec/api/tech/model/plan 索引；交互上下文标注 `— *交互上下文*`。运行 `scripts/sparrow-state.mjs set-step arch done`。

## 检查清单

- [ ] 子领域从业务价值划分，名称是名词
- [ ] ReAct 迭代至四维验证通过后才写 application.md
- [ ] 每个 BC 有 spec 切片；服务无遗漏无重复
- [ ] 有 UI 则 frontend.md 契约绑定表无未解决的 ⚠️
- [ ] `project.md` 已列出全部 slug

## 下一步

按 project.md 中的 slug 执行 **/sparrow-design @{slug}**。各 BC 与交互上下文互相独立，可并行。

{{PLUGIN:archify}}
{{HARNESS}}
