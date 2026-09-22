# 坏味道规约文档（OpenMole Bad Smells）

**版本**：0.1.4
**状态**：草案
**依据**：OpenMole 规约摘要（见 Skill 内嵌）；change 内 [tasks.md](./tasks.md)
**修订日期**：2026-09-22

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 坏味道环节正式规约载体 |
| **统计范围** | `src/core/ingest/`、`read-plan.ts`、requirement skill/harness/workflow、生成态 scripts |
| **关联任务** | 见 [tasks.md](./tasks.md) |

---

## 1. 说明

- 设计级扫描：封装、模块化、冗余、与 agent 可执行契约相关的设计接缝。
- 与 ARCH 同 change，侧重 **read-plan 命令串**、**多文档纪律**、**state 写入路径**。

> **跨 change 去重**：未重复 archive 中 `project-state`↔`sparrow-state.mjs` 全文件冗余（DESIGN-RD-001 已消除项）；本轮为 **ingest 计划命令** 与 **ensure-change 写 state** 的设计层问题。

---

## 2. 坏味道条目

### 2.0 索引与消除状态

| BS-ID | 类别 | 状态 | 说明 |
|-------|------|------|------|
| DESIGN-RD-002 | 冗余 | 已消除 | read-plan projectRoot + command `--project-root` |
| DESIGN-DF-002 | 数据泥团 | 已消除 | ingest 纪律以 requirement/ingest-cli.md 为单源 |
| DESIGN-EN-002 | 封装 | 已消除 | ensure --create 经 set-change + set-step |
| DESIGN-MO-002 | 模块化 | 已消除 | runIngest 拆为命名阶段函数 |

---

### DESIGN-RD-002 — read-plan 命令字符串与运行时上下文耦合

| 字段 | 内容 |
|------|------|
| **级别** | DESIGN |
| **位置** | `src/core/ingest/read-plan.ts` L39–43、L63（`showCommand`）；`read-plan.json` 生成于 `run.ts`；SKILL L36（原样执行 command） |
| **描述** | `command` 嵌入 `sparrow ingest show <sourcePath>`，其中 `sourcePath` 为 ingest 调用时的路径形式（相对/绝对），且 **未编码 projectRoot**。Agent 必须在「与 ingest 相同 cwd」执行；与 ARCH-LY-002 叠加后，同一 read-plan 在不同 shell 下可能解析到错误文件或空缓存。纪律在 SKILL 重复强调 cwd，但计划文件本身不自描述。（RD-02 式重复：Markdown + JSON 双源） |
| **对齐原则** | 宪法 §3 — 一致性、简洁性 |
| **消除标准（验收）** | 1) read-plan 含 `projectRoot` 字段或 command 含 `--project-root`；2) 单测锁定 command 生成；3) harness 更新为「先读 plan 内 root 再执行」。 |
| **风险与约束** | 旧 cache 目录可保留；迁移 optional。 |

---

### DESIGN-DF-002 — ingest MUST/MUST NOT 分散在 SKILL、harness、workflow-block

| 字段 | 内容 |
|------|------|
| **级别** | DESIGN |
| **位置** | `sparrow-requirement/SKILL.md` L34–37；`harness/requirement/requirements.md` L20–23；`workflow-blocks/sparrow-requirement.md` L5；对比 `schema.yaml`（无 ingest step 元数据） |
| **描述** | 三份 prose 高度同构（CLI only、禁 Python docx、stderr 进度、read-plan）。`461c270` 已对齐文案，但缺少 **单一生成源**（如 harness 片段 include 或 schema `agentConstraints`）。后续改 ingest 行为仍需三处 diff，易再出现 agent 找 `scripts/sparrow.mjs` 类漂移。（Shotgun Surgery 设计态） |
| **对齐原则** | 宪法 §3 — 一致性、可维护性 |
| **消除标准（验收）** | 1) 单源 Markdown 或 schema 字段驱动 SKILL + workflow-block + harness 同步（现有 sync-schema 管线可扩展）；2) CI 断言三处关键句一致；3) 文档注明「ingest 无 skill script」。 |
| **风险与约束** | 不恢复 skill scripts 包装 CLI。 |

---

### DESIGN-EN-002 — ensure-change-workspace 直接写 state，破坏 pipeline 封装

| 字段 | 内容 |
|------|------|
| **级别** | DESIGN |
| **位置** | `ensure-change-workspace.mjs` L55–61、L104；`SKILL.md` L38–39（create 后应 `set-step requirement ongoing`）；`sparrow-state.mjs` pipeline 语义 |
| **描述** | `--create` 仅设置 `active-change.changeId`，不调用 `set-step`。若 agent 跳过或 reorder 步骤 5 后半句，会出现 **目录已建、pipeline 仍 null 或旧步** 的状态。State 本应由 sparrow-state 脚本统一变更，ensure 脚本越权写 JSON。（Feature Envy / 不恰当 intimacy） |
| **对齐原则** | 宪法 §3 — 清晰性、健壮性 |
| **消除标准（验收）** | 1) create 后自动 spawn `sparrow-state.mjs set-step requirement ongoing` 或合并为单一子命令；2) `--check` 校验 pipeline 与目录一致；3) 行为测试或 harness 示例。 |
| **风险与约束** | 与 ARCH-CP-002  refactor 可合并执行。 |

---

### DESIGN-MO-002 — runIngest 单函数承担过多编排职责

| 字段 | 内容 |
|------|------|
| **级别** | DESIGN |
| **位置** | `src/core/ingest/run.ts`（`runIngest` 及私有 helper 约 L94–290：resolve、cache、parse、figures、OCR、signals、split、read-plan、progress、summary） |
| **描述** | Ingest 管线阶段（读源、缓存生命周期、图决策、分块、计划、进度 JSON）堆叠在同一模块流程中，测试虽覆盖子模块，但 **变更 ingest 契约**（如 ARCH-LY-002 的 projectRoot）需触达大函数。Agent 运行时错误难定位到子步骤。（MO-01 上帝流程） |
| **对齐原则** | 宪法 §3 — 清晰性、可扩展性 |
| **消除标准（验收）** | 1) 拆为可单测阶段函数（cache hit path / miss path / show path 已部分分离）；2) `runIngest` 降为编排；3) 现有 ingest 测试全绿。 |
| **风险与约束** | 避免行为变更；保持 stderr 进度格式稳定。 |

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 说明 |
|------|------|----------|------|
| 0.1.0 | 2026-09-22 | `461c270237ee49b2bc28bb4e9aa13986b88a911e` | 初版：DESIGN-RD-002、DESIGN-DF-002、DESIGN-EN-002、DESIGN-MO-002。 |
| 0.1.1 | 2026-09-22 | — | impl B-T04：DESIGN-EN-002 → 已消除。 |
| 0.1.2 | 2026-09-22 | — | impl B-T03：DESIGN-RD-002 → 已消除。 |
| 0.1.3 | 2026-09-22 | — | design B-T02：DESIGN-DF-002 → 已消除（ingest-cli.md 单源）。 |
| 0.1.4 | 2026-09-22 | — | design B-T04：DESIGN-MO-002 → 已消除。 |
