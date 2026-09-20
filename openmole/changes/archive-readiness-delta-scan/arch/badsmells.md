# 坏味道规约文档（OpenMole Bad Smells）

**版本**：0.3.0
**状态**：草案
**依据**：OpenMole 规约摘要（见 Skill 内嵌）；change 内 [tasks.md](./tasks.md)
**修订日期**：2026-09-20

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 坏味道环节正式规约载体 |
| **统计范围** | `src/`（TypeScript）+ 生成态脚本模板 `src/schemas/templates/shared/scripts/sparrow-state.mjs` |
| **关联任务** | 见 [tasks.md](./tasks.md)（待 `mole-plan`） |

---

## 1. 说明

- 条目格式见 Skill 内嵌 specification §4。
- 升版时填写修订历史「提交版本」（specification §7）。
- 本 change 的 **ARCH** 级别扫描，范围：模块化、耦合、内聚、层次、边界、演进。

> **跨 change 去重**：`archive/2026-08-13-initial-scan` 中 ARCH-CP-001/002、ARCH-LY-001、ARCH-CH-001、ARCH-EV-001 均为 **已消除**；本轮不重复开单。本轮聚焦 archive 门控 / state 双轨 / promote 可达性带来的新架构味道。

> **扫描结论**：状态与归档判定逻辑在 core TS 与生成态 `.mjs` 双轨维护（分散式耦合）；`project-state.ts` 内聚不足；archive skill 要求必做 promote，但目标项目仅有 `sparrow-state.mjs`、无 promote 可执行入口（边界/演进僵化）。

---

## 2. 坏味道条目

### 2.0 索引与消除状态

| BS-ID | 类别 | 状态 | 说明 |
|-------|------|------|------|
| ARCH-CP-001 | 耦合性 | 已消除 | state/archive 判定在 TS 与 mjs 双轨复制（CP-04） |
| ARCH-CH-001 | 内聚性 | 已消除 | `project-state.ts` 混合 IO/探测/流水线/归档门控（CH-01） |
| ARCH-BD-001 | 边界性 | 未清除 | archive skill 依赖 core `promoteChangeToMaster`，生成态无 ACL/脚本入口（BD-04） |
| ARCH-EV-001 | 演进性 | 未清除 | 变更 archive 规则需同步改 core + 模板脚本 + skill 文案（EV-02） |

---

### ARCH-CP-001 — state / archive 判定双轨复制

| 字段 | 内容 |
|------|------|
| **级别** | ARCH |
| **位置** | `src/core/project-state.ts`（`normalizeProjectState`、`detectDevelopmentMode`、`checkArchiveReadiness`、`IGNORE_DIRS`/`SOURCE_EXT`/`MODES`/`STEPS`）；`src/schemas/templates/shared/scripts/sparrow-state.mjs`（`normalize`、`detectMode`、`checkArchive` 及同类常量，约 L24–200） |
| **描述** | 同一领域规则（模式探测、slug 完成判定=`verify`+`done`、上下文剪枝）在框架 core 与下发到用户项目的机械脚本中各实现一份。路径常量亦未复用 `spec-paths.ts`，形成隐含双源真相。任一轨更新遗漏即造成 CLI/测试与 agent 脚本行为分叉。（LargeSW: Scattered Coupling） |
| **对齐原则** | 宪法 §3 — 一致性、可扩展性 |
| **消除标准（验收）** | 1) 单一实现源（core 导出或由构建生成 mjs）；2) 探测/门控/常量无手写双份；3) 改一处规则两边行为一致的测试或生成校验；4) `npm test` + typecheck 通过。 |
| **风险与约束** | 用户项目已安装的旧 `scripts/sparrow-state.mjs` 需 `sparrow update` 刷新；生成脚本需保持无编译依赖、可在纯 Node 下运行。 |

---

### ARCH-CH-001 — `project-state.ts` 低内聚模块

| 字段 | 内容 |
|------|------|
| **级别** | ARCH |
| **位置** | `src/core/project-state.ts`（约 466 行：state IO L113–218、wipe/探测 L220–290、pipeline 变更 L292–351、archive 门控 L372–466） |
| **描述** | 单文件同时承担持久化、遗留迁移、规格树清空、源码探测、流水线状态机、归档就绪汇总。变更归档门控会触碰同一模块内无关的 wipe/detect 能力，模块边界模糊，阻碍独立演进与测试切片。（LargeSW: Low Cohesion） |
| **对齐原则** | 宪法 §3 — 清晰性、可扩展性 |
| **消除标准（验收）** | 1) 按职责拆为 ≥2 个模块（如 `project-state` IO、`development-mode`、`archive-readiness`）；2) 对外 API 保持兼容或提供薄 facade；3) 现有 `project-state.test.ts` 覆盖迁移到新边界后仍绿。 |
| **风险与约束** | `init.ts` / CLI / 测试大量 import 该模块；拆分时需保持导出符号稳定或同步更新调用方。 |

---

### ARCH-BD-001 — promote 能力对 agent 运行时边界缺失

| 字段 | 内容 |
|------|------|
| **位置** | `src/core/spec-promote.ts`（`promoteChangeToMaster`）；`src/schemas/templates/skills/sparrow-archive/SKILL.md` L34（要求 promote 且可调用 `promoteChangeToMaster`）；生成 skill 仅复制 `scripts/sparrow-state.mjs`，无 promote 脚本 |
| **级别** | ARCH |
| **描述** | Archive 产品流程规定「归档必 promote」，但用户工作区 agent 只能机械执行下发的 `.mjs`；`promoteChangeToMaster` 仅存在于 sparrow 包源码/测试，未作为生成态边界暴露。skill 文案指向 core API，形成跨边界概念泄漏：agent 无法可靠完成必做步骤，只能手写拷贝或跳过。（DDD: Missing ACL / Boundary Leakage） |
| **对齐原则** | 宪法 §3 — 清晰性、健壮性 |
| **消除标准（验收）** | 1) 提供与 state 脚本同级的 promote CLI/脚本（或 sparrow 子命令）并可被 skill 引用；2) SKILL.md 指向可执行入口而非 TS 符号；3) 至少一条端到端/集成测覆盖「脚本 promote → master delta」。 |
| **风险与约束** | 脚本需捆绑 delta 规则（ADDED/MODIFIED/REMOVED）；避免在用户项目依赖未发布的 sparrow 内部路径。 |

---

### ARCH-EV-001 — archive 规则变更的多点僵化

| 字段 | 内容 |
|------|------|
| **级别** | ARCH |
| **位置** | `project-state.ts` + `sparrow-state.mjs` + `sparrow-archive/SKILL.md` + `workflow-blocks/sparrow-archive.md` + README 双语 |
| **描述** | 调整「slug 完成判定」或「部分归档语义」需同步修改 core、生成脚本、skill/workflow 文案与对外文档。缺少单一驱动源（schema/状态机描述），易出现文档与机械脚本不一致。（LargeSW: Rigidity Point） |
| **对齐原则** | 宪法 §3 — 一致性、可扩展性 |
| **消除标准（验收）** | 1) 完成判定与命令表由单一源生成 skill/脚本片段，或测试断言文案关键字与实现一致；2) 变更完成标准时改动点数 ≤2（实现 + 生成物）；3) 回归 suite 覆盖 check-archive 契约。 |
| **风险与约束** | 与 ARCH-CP-001/BD-001 高度相关，建议先统一实现源再收敛文档生成。 |

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-09-20 | `fe8c2cc` | 初版：ARCH-CP-001、ARCH-CH-001、ARCH-BD-001、ARCH-EV-001。 |
| 0.2.0 | 2026-09-20 | — | B-T01：mjs 由 project-state 打包生成；ARCH-CP-001 → 已消除。 |
| 0.3.0 | 2026-09-20 | — | B-T02：拆分 types/io/development-mode/archive-readiness；ARCH-CH-001 → 已消除。 |
