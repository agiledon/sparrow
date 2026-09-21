# Sparrow Requirement — 分层需求与业务服务识别

## 完成标准

下列路径已按对应 `assets/` 模板写满必填块（相对 `docs/sparrow/change/current/{activeChangeId}/`）：

- `assets/proposal.md` → `proposal.md`（`development-mode` 抄自 `.sparrow/sparrow-state.json`）
- `assets/catalog.md` → `requirement/business/catalog.md`（含 EBP→BS 表与嵌套链接）
- `assets/subdomain.md` → `requirement/business/{sd-slug}/subdomain.md`
- `assets/scenario.md` → `requirement/business/{sd-slug}/{c-slug}/{s-slug}/scenario.md`（省略能力层时去掉 `{c-slug}/`）
- `assets/business-services.md` → `requirement/business/{sd-slug}/{c-slug}/{s-slug}/business-services.md`（省略能力层时去掉 `{c-slug}/`；本场景全部 BS 合并于此）
- `assets/service.md` → 各服务块写入同一文件标题 `## BS-{id}`，路径 `requirement/business/{sd-slug}/{c-slug}/{s-slug}/business-services.md#BS-{id}`
- `assets/quality.md` → `requirement/quality/quality.md`
- 共享 `assets/project.md` → `project.md`（若不存在则按固定模板创建；§1.1 只链 catalog）

能力超过阈值时另写：`assets/capability.md` → `requirement/business/{sd-slug}/{c-slug}/capability.md`。未达阈值则省略能力层（不建 `{c-slug}/`、不写 `capability.md`）。

有 UI 探索时另写：

- `assets/ui-spec.md` → `requirement/ui/ui-spec.md`（端到端操作流程 ← EBP）
- `assets/design-tokens.md` → `requirement/ui/design-tokens.md`
- `assets/component-library.md` → `requirement/ui/components/component-library.md`
- `assets/prototype-index.html` → `requirement/ui/prototypes/index.html`（及页面 html）

不得改模板章节结构。未涉及的质量属性维度直接省略。**不要**再以 `prd-business.md` 作为主产出（迁移见 `references/compat-migrate.md`）。正文语言遵循 harness `common/always/document-language.md`（`sparrow-config.json` 的 `lang`）。

## 步骤

工作目录为**项目根**。脚本在本 skill 的 `scripts/` 下。

1. 读 `references/ubiquitous-language.md` 与 `references/spec-layout-guide.md`。运行 `scripts/sparrow-state.mjs show`。
2. 若 `development-mode` 为 `tbd`：运行 `scripts/sparrow-state.mjs detect-mode`，把输出的 `mode` 写入 `set-mode`。判定规则（脚本已实现）：archive 与 change 皆空且无源码 → `greenfield`；皆空且有源码 → `brownfield`；archive / change / master 已有规格 → `iteration`。
3. 若模式为 `brownfield`：告知用户 Sparrow 暂不支持棕地核心流程，**停止**。不创建 change 工作区，不 Grill Me。`pipeline` 保持为空。
4. `greenfield` 与 `iteration` 走同一套核心流程（iteration 仍按 revise / master diff）。收集本次需求分析输入：
   - 用户消息中的 `@path`（可多个）为显式输入，不全库搜索。对每个路径在项目根运行 `sparrow ingest <path>`（进度只出现在该命令的 **stderr**，禁止用模型输出复述）。然后只读取该次写入的 `read-plan.json` 点名的文本：对清单项执行 `sparrow ingest show <path> --section <id> [--offset N]`。禁止打开清单外的节或图片，禁止自行摘要原文，禁止看图像素或用模型描述图。图中没有被 OCR 或题注写下来的步骤不得写入需求分析。
   - 无 `@` 时：若用户已给提示词或显式文件路径，以用户输入为准；否则在仓库内搜索文本/Markdown（文件名或路径含 `prd`、`srs`、`requirement`、`需求`、`规格`），**排除** `docs/sparrow/`。搜到的文件同样先 `sparrow ingest`，再按 `read-plan.json` 阅读。有候选则请用户确认；没有则请用户给出原始需求或指定文档。无输入则停止。
5. 从项目根运行 `scripts/ensure-change-workspace.mjs --check`。若退出码 1：按 `requirement/requirements.md`「活动变更 ID 确认纪律」只确认 change-id；用户中止则停止且不创建子目录。确认后运行 `scripts/ensure-change-workspace.mjs --create {change-id}`，再按 `assets/proposal.md` 填写 `proposal.md`（development-mode 用配置值）。禁止向 `master/` 写入。运行 `scripts/sparrow-state.mjs set-step requirement ongoing`。
6. 读 `references/revise-gate.md`。无活动变更基线则走全量；有则对 master 需求做 ADDED / MODIFIED / REMOVED 增量，在 change 工作区更新，不写 version 元数据。若存在旧 `prd-business.md` 或扁平 `subdomains/` · `services/`，先按 `references/compat-migrate.md` 迁移。
7. 读 `references/output-existence-check.md`，对本阶段已存在的 catalog / subdomain / business-services / quality 等做一次 skip / overwrite / update。
8. 阶段一 Grill Me：读 `references/grill-me.md`「需求探索」，按 SD→C→S→EBP→BS→规则→质量推进，遵守互动纪律，覆盖全部维度后输出快速总结。
9. 落盘结构：读 `references/subdomain-rules.md`，写 `catalog.md` 与嵌套树 `{sd-slug}/subdomain.md`；能力达阈值则写 `{c-slug}/capability.md` 且场景在能力下，否则场景直接在子领域下。
10. 读 `references/business-service-rules.md`，沿 EBP 按场景合并写入各 `business-services.md`（块模板 `service.md`，EARS）；做 E2E 覆盖自检并更新 catalog。写 `quality.md`（仅涉及维度）。
11. 询问是否做 UI 探索。否：跳过。是：读 `grill-me.md`「UI 探索」，将 EBP 转为端到端操作流程，再按 UI 模板写入 `requirement/ui/`。本阶段页面不关联 BC。
12. 读 `references/project-md-update.md` 与 `references/version-metadata.md`，更新 change 工作区 `project.md`（§1.1 只勾选 catalog）。运行 `scripts/sparrow-state.mjs set-step requirement done`。

## 检查清单

- [ ] `sparrow-state.json` 的 development-mode 已确定且非 brownfield
- [ ] change-id 已确认且工作区在 `change/current/{id}/`
- [ ] Grill Me 维度均已确认并有快速总结（含 EBP）
- [ ] catalog 含嵌套链接与 EBP→BS；无遗漏系统步骤、无孤儿 BS
- [ ] 场景含 5W；同场景 BS 合于 `business-services.md`；验收为 EARS；一次请求一个服务；名称动宾
- [ ] 质量属性无空章节
- [ ] 若做了 UI：操作流程回溯 EBP、无孤儿页面、原型可走通
- [ ] `project.md` 已更新且 §1.1 只链 catalog；pipeline `requirement` 为 `done`

## 下一步

执行 **/sparrow-arch**。若有 UI 产出，arch 将同时生成 `architecture/frontend.md`。

{{PLUGIN:sparrow-ui}}
{{HARNESS}}
