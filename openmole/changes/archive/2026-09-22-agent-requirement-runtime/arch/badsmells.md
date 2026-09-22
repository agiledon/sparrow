# 坏味道规约文档（OpenMole Bad Smells）

**版本**：0.1.4
**状态**：草案
**依据**：OpenMole 规约摘要（见 Skill 内嵌）；change 内 [tasks.md](./tasks.md)
**修订日期**：2026-09-22

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 坏味道环节正式规约载体 |
| **统计范围** | 全仓 `.`（结构预扫描）；语义聚焦 requirement agent 运行时（CLI ingest + 生成态 scripts + init/schema 边界） |
| **关联任务** | 见 [tasks.md](./tasks.md) |

---

## 1. 说明

- 条目格式见 Skill 内嵌 specification §4。
- 结构预扫描：`node .cursor/skills/openmole-explore/scripts/structure-scan.mjs . --json`（`smellSeeds` 含 `src/core` CP-02/MO-02 环、CP-03/MO-03 扇入扇出、`RD-01` core↔模板 scripts 令牌重复）；本 change **不**将环内 A 级种子直接开单，仅作背景。
- 本 change 主题：**sparrow-requirement 阶段 agent 如何可靠调用 ingest CLI 与项目根纪律**，而非 archive/promote（见 archive delta-scan）。

> **跨 change 去重**：`archive/2026-09-20-archive-readiness-delta-scan` 已覆盖 **state 全量双轨**（`project-state.ts` ↔ `sparrow-state.mjs`，ARCH-CP-001 / DESIGN-RD-001）。本 change **不重复**该指纹。`ensure-change-workspace.mjs` 的 **active-change 局部读写** 与 **ingest 未进入 schema scripts** 为本轮 net-new。

> **扫描结论**：ingest 能力只在 Sparrow 包 CLI/core，生成态仅下发 state 脚本；init 不验证 CLI 就绪；ingest 缓存键依赖隐式 `cwd`，与 SKILL「项目根」纪律之间存在架构边界缺口。

---

## 2. 坏味道条目

### 2.0 索引与消除状态

| BS-ID | 类别 | 状态 | 说明 |
|-------|------|------|------|
| ARCH-BD-002 | 边界性 | 已消除 | init/update 写入 `.sparrow/cli-readiness.json` |
| ARCH-LY-002 | 层次性 | 已消除 | CLI `--project-root` + read-plan 自描述 |
| ARCH-BD-003 | 边界性 | 已消除 | schema cliCommands + 生成 SKILL/斜杠命令可见 ingest CLI |
| ARCH-CP-002 | 耦合性 | 已消除 | ensure-change-workspace 委托 sparrow-state.mjs |

---

### ARCH-BD-002 — init/update 不校验 agent 能否调用 Sparrow CLI

| 字段 | 内容 |
|------|------|
| **级别** | ARCH |
| **位置** | `src/core/init.ts`（生成 skill/harness/state，无 CLI 预检）；`src/schemas/templates/skills/sparrow-requirement/SKILL.md` L34–36（步骤 4 才要求 `sparrow --version`）；`src/cli/index.ts` `init`/`update` 命令 |
| **描述** | Requirement 阶段 ingest **必须**走 `sparrow ingest`，但 `sparrow init`/`update` 只下发文档与 `sparrow-state.mjs`，不在生成态或配置中记录「CLI 可用」或引导 `npm link`/全局安装。Agent 往往在未 link 的 checkout 或仅复制 skill 的项目里启动，直到步骤 4 才失败，浪费回合。（Missing runtime ACL / Boundary） |
| **对齐原则** | 宪法 §3 — 健壮性、清晰性 |
| **消除标准（验收）** | 1) init/update 输出或写入 `.sparrow/` 的就绪清单含 CLI 探测结果；或 2) README/harness 与 init 文案强制同序前置检查；3) 文档化「agent 项目根 + sparrow 解析顺序（bin / npx / global）」；4) 至少一条测试或 smoke 覆盖「无 CLI 时 requirement 步骤应停止」的契约。 |
| **风险与约束** | 不在 init 中静默 `npm install sparrow-ddd`；保持离线/企业镜像友好。 |

---

### ARCH-LY-002 — ingest CLI 以 process.cwd() 为项目根，无显式参数

| 字段 | 内容 |
|------|------|
| **级别** | ARCH |
| **位置** | `src/core/ingest/run.ts` L119、L294、L336（`projectRoot ?? process.cwd()`）；`src/cli/index.ts` L273–307（ingest 子命令未传 `projectRoot`）；`SKILL.md` L34–36（要求 cwd=项目根） |
| **描述** | 缓存目录 `.sparrow/ingest/` 与 hash 桶绑定 **projectRoot**，但 CLI 仅通过 **当前工作目录** 推断。Commander action 层未提供 `--project-root`，与 state 脚本「从项目根运行」的纪律不对称：agent 子 shell、IDE 任务或 monorepo 子目录 cwd 漂移会导致缓存 miss、read-plan 与 show 不一致。（Layer: CLI 参数面缺失，业务规则泄漏到 agent 行为） |
| **对齐原则** | 宪法 §3 — 一致性、健壮性 |
| **消除标准（验收）** | 1) `sparrow ingest` / `ingest show` / `ingest clean` 支持 `--project-root`（默认 cwd）；2) read-plan `command` 字段在需要时含相同 flag；3) 测试覆盖「cwd≠root 但 flag 正确仍命中缓存」。 |
| **风险与约束** | 保持默认行为与现网脚本兼容；Windows 路径 quoting 与 read-plan 一致。 |

---

### ARCH-BD-003 — ingest 未纳入 schema 生成态脚本边界

| 字段 | 内容 |
|------|------|
| **级别** | ARCH |
| **位置** | `src/schemas/schema.yaml` 各 skill `scripts:` 仅 `sparrow-state.mjs`（及 requirement 的 `ensure-change-workspace.mjs` 在模板目录）；`src/core/ingest/` 整模块；`workflow-blocks/sparrow-requirement.md` L5 |
| **描述** | 产品将 ingest 定为 **包内 CLI**（刻意不用 skill scripts 包装），但 schema 的「可机械执行面」只覆盖 state。Agent 适配器常优先扫描 `scripts/`，易误判「无 ingest 脚本 = 自写解析」。ingest 纪律仅存在于 Markdown harness/SKILL，缺少与 `schema.yaml` steps 同级的可发现边界。（DDD: 能力在 core，agent 可见面在 docs） |
| **对齐原则** | 宪法 §3 — 清晰性、可扩展性 |
| **消除标准（验收）** | 1) schema 或 workflow-block 声明 `cliCommands: [ingest]`（或等价元数据）供 init 生成 IDE 提示；2) command adapter 文档列出 requirement 前置 CLI；3) 禁止在 skill `scripts/` 重新引入 ingest 包装（保持单入口）。 |
| **风险与约束** | 不把 mammoth/unpdf 打进用户项目 scripts。 |

---

### ARCH-CP-002 — ensure-change-workspace 与 state 脚本第三次局部复制

| 字段 | 内容 |
|------|------|
| **级别** | ARCH |
| **位置** | `src/schemas/templates/skills/sparrow-requirement/scripts/ensure-change-workspace.mjs` L24–61（`defaultState`/`loadState`/`writeChangeId`）；`src/schemas/templates/shared/scripts/sparrow-state.mjs`；`src/core/project-state.ts` |
| **描述** | Archive 已追踪 **core ↔ sparrow-state.mjs** 全量双轨。Requirement 另含 **ensure-change-workspace** 独立读写 `active-change` 与 `development-mode`/`pipeline` 剪枝规则（如 tbd 时 pipeline null），与 `sparrow-state.mjs set-step` 路径并行。Agent 步骤 5 混用两者，易出现 changeId 已写但 pipeline 未 `ongoing` 的分叉。（Scattered Coupling 第三锚点） |
| **对齐原则** | 宪法 §3 — 一致性 |
| **消除标准（验收）** | 1) `--create`/`--check` 委托 `sparrow-state.mjs` 子命令或单一 JSON 补丁 API；2) 删除 ensure 内 duplicate load/write；3) 集成测：create 后 state 与 set-step 预期一致。 |
| **风险与约束** | 保持脚本零 TS 编译依赖；用户已安装旧 ensure 脚本需 update 刷新。 |

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 说明 |
|------|------|----------|------|
| 0.1.0 | 2026-09-22 | `461c270237ee49b2bc28bb4e9aa13986b88a911e` | 初版：ARCH-BD-002、ARCH-LY-002、ARCH-BD-003、ARCH-CP-002。 |
| 0.1.1 | 2026-09-22 | — | impl B-T04：ARCH-CP-002 → 已消除。 |
| 0.1.2 | 2026-09-22 | — | impl B-T02/B-T03：ARCH-LY-002 → 已消除。 |
| 0.1.3 | 2026-09-22 | — | arch B-T02：ARCH-BD-003 → 已消除。 |
| 0.1.4 | 2026-09-22 | — | arch B-T03：ARCH-BD-002 → 已消除。 |
