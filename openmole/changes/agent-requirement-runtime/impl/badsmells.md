# 坏味道规约文档（OpenMole Bad Smells）

**版本**：0.1.3
**状态**：草案
**依据**：OpenMole 规约摘要（见 Skill 内嵌）；change 内 [tasks.md](./tasks.md)
**修订日期**：2026-09-22

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 坏味道环节正式规约载体 |
| **统计范围** | `bin/sparrow.js`、`src/cli/index.ts`、`src/core/ingest/`、requirement 生成态 `.mjs` |
| **关联任务** | 见 [tasks.md](./tasks.md) |

---

## 1. 说明

- 实现级：函数长度、CLI 面、launcher 行为、魔法字符串。
- TypeScript 项目：vitest/`node --test` 为回归手段（见各条目消除标准）。

---

## 2. 坏味道条目

### 2.0 索引与消除状态

| BS-ID | 类别 | 状态 | 说明 |
|-------|------|------|------|
| IMPL-GEN-008 | 通用 | 已消除 | bin/sparrow.js tsx 缺失时静默降级 |
| IMPL-GEN-009 | 通用 | 已消除 | CLI `--project-root` 与 read-plan command 同步 |
| IMPL-GEN-010 | 通用 | 未清除 | ensure loadState 剪枝规则与 state 脚本分叉 |
| IMPL-GEN-011 | 通用 | 已消除 | showCommand 硬编码 CLI 子命令字符串 |

---

### IMPL-GEN-008 — bin/sparrow.js 在 tsx 缺失时无提示 fall through

| 字段 | 内容 |
|------|------|
| **级别** | IMPL |
| **位置** | `bin/sparrow.js` L19–42（`require.resolve('tsx')` 失败则跳过）；L44–48（仅 dist 缺失时报错） |
| **描述** | Git checkout 存在 `src/cli/index.ts` 但未 `npm install` tsx 时，launcher **不**说明「应安装依赖或 build」，直接尝试 `dist/sparrow.js`。Agent/开发者看到「bundle not found」易误判为未 build，而非 devDependency 缺失，增加 requirement 阶段排查成本。 |
| **对齐原则** | 宪法 §3 — 清晰性、健壮性 |
| **消除标准（验收）** | 1) tsx 缺失且 src 存在时 `console.error` 明确提示 `npm install`；2) 可选仍尝试 dist；3) 文档或 smoke 覆盖。 |
| **风险与约束** | 不改变 publish 安装路径（无 src 时行为不变）。 |

---

### IMPL-GEN-009 — ingest 子命令未接线 IngestOptions.projectRoot

| 字段 | 内容 |
|------|------|
| **级别** | IMPL |
| **位置** | `src/cli/index.ts` L273–307；`src/core/ingest/run.ts` `IngestOptions`；对比 ingest 单测直接传 `projectRoot` |
| **描述** | Core 已支持 `projectRoot`，CLI 始终用默认 `process.cwd()`。测试与 agent 生产路径不一致，ARCH/DESIGN 层修复无法仅改 CLI 完成。属于 **测试替身与 CLI 表面不一致** 的实现债。 |
| **对齐原则** | 宪法 §3 — 一致性 |
| **消除标准（验收）** | 1) commander `.option('--project-root')` 传入 `runIngest`/`showSection`/`runClean`；2) CLI 集成测；3) read-plan 生成同步（见 DESIGN-RD-002）。 |
| **风险与约束** | 默认值保持 cwd。 |

---

### IMPL-GEN-010 — ensure-change-workspace 内联 state 归一化与 sparrow-state 不一致

| 字段 | 内容 |
|------|------|
| **级别** | IMPL |
| **位置** | `ensure-change-workspace.mjs` L32–48（`loadState` 只保留部分字段、静默 catch）；`sparrow-state.mjs` 完整 normalize |
| **描述** | `loadState` 丢弃未知字段、遇 JSON 错误返回 defaultState，与 state 脚本 **fail-fast/merge** 行为不同。Agent 先跑 ensure 再 show 可能看到不同 `pipeline` 视图。实现层重复且语义更弱。 |
| **对齐原则** | 宪法 §3 — 一致性、健壮性 |
| **消除标准（验收）** | 1) 删除内联 parse，改为 exec/spawn state 脚本 query；2) 或共享生成的 JSON schema 校验；3) 单测对比两路径输出。 |
| **风险与约束** | 脚本须保持 Node 内置模块 only。 |

---

### IMPL-GEN-011 — read-plan 硬编码 `sparrow ingest show` 命令文本

| 字段 | 内容 |
|------|------|
| **级别** | IMPL |
| **位置** | `src/core/ingest/read-plan.ts` L39–42；`src/cli/index.ts` ingest 子命令注册名 |
| **描述** | CLI 若重命名子命令或加全局 prefix，read-plan 与 commander 定义 **无共享常量**，仅靠字符串同步。Requirement agent **必须原样执行** command，一处改名即破坏旧 cache plan。 |
| **对齐原则** | 宪法 §3 — 可维护性 |
| **消除标准（验收）** | 1) 导出 `INGEST_SHOW_CMD` 或从 commander 元数据生成；2) 单测 snapshot command；3) 版本化 read-plan schema。 |
| **风险与约束** | 已落盘 read-plan.json 需兼容旧 command 或 bump cache hash。 |

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 说明 |
|------|------|----------|------|
| 0.1.0 | 2026-09-22 | `461c270237ee49b2bc28bb4e9aa13986b88a911e` | 初版：IMPL-GEN-008～011。 |
| 0.1.1 | 2026-09-22 | — | mole-apply impl B-T01：IMPL-GEN-008 → 已消除。 |
| 0.1.2 | 2026-09-22 | — | mole-apply impl B-T02：CLI `--project-root`；IMPL-GEN-009 → 部分残余。 |
| 0.1.3 | 2026-09-22 | — | mole-apply impl B-T03：cli-strings + read-plan projectRoot；GEN-009/011 已消除。 |
