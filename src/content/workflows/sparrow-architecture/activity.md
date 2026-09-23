# Sparrow Arch — 限界上下文与规格切片

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`，按模板写满必填块：

- `assets/bounded-contexts.md` → `architecture/bounded-contexts.md`（含 SD→BC 一对一映射表，再记调整）
- 每个后端 BC：`assets/spec.md` → `design/{slug}/spec.md`（薄投影 + Properties）

有 UI 时：

- `assets/frontend.md` → `architecture/frontend.md`
- `assets/spec-interaction.md` → `design/{ui-slug}/spec.md`

更新 `project.md` 的 BC / 交互上下文索引。不得改模板章节结构。正文语言遵循 harness `common/always/document-language.md`。

## 步骤

1. 运行本 skill 的 `scripts/sparrow-state.mjs show`。`development-mode` 为 `tbd` 则先 **sparrow-requirement**；为 `brownfield` 则停止（暂不支持）。通过后 `set-step architecture ongoing`。
2. 读 `references/ubiquitous-language.md`、`references/spec-layout-guide.md`、`references/revise-gate.md`。确认 `requirement/business/catalog.md` 与至少一份 `business-services.md` 存在；否则先 requirement。
3. 读 `references/output-existence-check.md`，对 bounded-contexts.md / 已有 spec.md 做一次 skip / overwrite / update。
4. **映射**：读取 catalog 与各 `{sd-slug}/subdomain.md`。先将每个 SD **一对一**映射为 BC，再按 ReAct（`references/react-mapping.md`）识别拆分/合并等调整；遵守 harness `arch/bounded-contexts.md`。写入 `architecture/bounded-contexts.md`。
5. **切片**：为每个 BC 创建 `design/{slug}/`，按归属把 BS 薄投影写入 `spec.md`；读 `references/property-rules.md` 与 harness `arch/spec-slice.md`，从 EARS 抽取 Properties。
6. 若 `requirement/ui/` 存在：读 `references/frontend-architecture.md`，按 frontend / spec-interaction 模板写入（业务服务源改为 catalog 所链 `business-services.md#BS-*`）。否则按该文件询问是否补 UI。
7. revise 时读 `references/bc-tiers.md`，按档位落实 diff；破坏性操作须用户确认。
8. 读 `references/project-md-update.md`：为每个 slug 添加 spec/api/tech/model/plan 索引；交互上下文标注 `— *交互上下文*`。运行 `scripts/sparrow-state.mjs set-step architecture done`。
