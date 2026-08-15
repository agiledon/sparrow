# 坏味道规约文档（OpenMole Bad Smells）

**版本**：0.5.0
**状态**：草案
**依据**：OpenMole 规约摘要（见 Skill 内嵌）；change 内 [tasks.md](./tasks.md)
**修订日期**：2026-08-13

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 坏味道环节正式规约载体 |
| **统计范围** | `src/`（40 个 TypeScript 文件，约 7092 行） |
| **关联任务** | 见 [tasks.md](./tasks.md) |

---

## 1. 说明

- 条目格式见 Skill 内嵌 specification §4。
- 升版时填写修订历史「提交版本」（specification §7）。
- 本 change 锁定 **IMPL** 级别，加载 IMPL-COMMON（通用）+ IMPL-LANG（TypeScript 语言特定 + 函数式公共）。

> **非本级别观察**：扫描中另观察到若干 DESIGN 级坏味道，不属于本 impl 级别条目，建议后续执行 `mole:explore design` 单独扫描：
> - 8 个工具适配器（claude/opencode/cursor/codex/kiro/qoder/trae/pi）重复实现几乎相同的 `formatHarnessRef` / `formatSkill` / `formatCommand`（Duplicate Code / RD-01）。
> - `src/core/version.ts` 整个模块疑似死代码（导出均未被引用，RD-02）。
> - `generateProjectConfig` / `generateProjectMd` 共享 `(projectRoot, projectName, version, toolIds)` 参数团（Data Clump / DESIGN-BS-04）。

---

## 2. 坏味道条目

### 2.0 索引与消除状态

| BS-ID | 类别 | 状态 | 说明 |
|-------|------|------|------|
| IMPL-TS-001 | TypeScript 语言特定 | 已消除 | `catch (e: any)` 用 any 逃逸类型检查（TS-01） |
| IMPL-GEN-001 | 命名 | 已消除 | `prd-quanlity.md` 拼写错误散落 10+ 处（IMPL-01） |
| IMPL-GEN-002 | 一致性 / 魔法值 | 已消除 | 框架版本号三处魔法值漂移，version.ts 死代码（IMPL-01） |
| IMPL-GEN-003 | 函数 | 已消除 | `update` 命令处理器约 95 行、六类职责混杂（IMPL-02） |

---

### IMPL-TS-001 — `catch (e: any)` 用 any 逃逸类型检查

| 字段 | 内容 |
|------|------|
| **级别** | IMPL（ARCH / DESIGN / IMPL） |
| **位置** | `src/cli/index.ts:157`（`} catch (e: any) {`，`update` 命令内） |
| **描述** | `update` 命令查询 npm 版本时用 `catch (e: any)` 捕获异常，随后通过 `e?.status` 与 `e?.signal` 判定超时。`any` 完全绕过了 TypeScript 类型检查，异常对象的结构（`status`、`signal` 字段）未在类型层面声明；若 Node/`execSync` 抛出的错误结构变化，编译期无法发现。同文件 `init` 命令的 `catch (error)` 已收敛为 `unknown` 风格，两处错误处理风格不一致。（TS-01: any 类型逃避） |
| **对齐原则** | 宪法 §3 — 健壮性 |
| **消除标准（验收）** | 1) 移除 `e: any`，改用 `catch (e: unknown)` 或类型守卫（如 `isExecSyncTimeoutError` 谓词）精确判定 `status`/`signal`；2) 全项目不再出现 `: any` / `as any`；3) `npm run typecheck` 通过且无 any 逃逸。 |
| **风险与约束** | `execSync` 抛出的错误对象在 `@types/node` 中需通过类型守卫访问 `status`/`signal`；改动仅限错误处理分支，不改变用户可见行为与退出码。 |

---

### IMPL-GEN-001 — `prd-quanlity.md` 拼写错误散落多处

| 字段 | 内容 |
|------|------|
| **级别** | IMPL（ARCH / DESIGN / IMPL） |
| **位置** | `src/core/project-md.ts:58,119`；`src/skills/explore.ts:33,50,90,152,190,192,418,497,612`；`src/skills/arch.ts:22,132` |
| **描述** | 质量属性文档文件名被拼写为 `prd-quanlity.md`（正确应为 `prd-quality.md`）。该错误拼写作为字符串字面量在 project.md 模板、explore/arch skill 模板中重复出现 10+ 次。由于该字符串直接决定生成的文件路径与文档索引链接，拼写错误会传播到所有生成产物；且未来修正需在多处同步修改，已形成「牵一发动全身」的维护隐患。（IMPL-01: Mysterious Name） |
| **对齐原则** | 宪法 §3 — 清晰性 |
| **消除标准（验收）** | 1) 所有出现处统一修正为 `prd-quality.md`；2) 建议将文件名抽为常量（如 `PRD_QUALITY_PATH`）消除字符串散落；3) 生成产物路径与索引链接拼写一致、无遗漏（全文搜索 `quanlity` 为 0 处）。 |
| **风险与约束** | 若已有历史项目生成了 `prd-quanlity.md` 文件，改名需考虑兼容/迁移提示；本次为纯字符串替换，无运行时逻辑影响，但需全文搜索确认无遗漏。 |

---

### IMPL-GEN-002 — 框架版本号魔法值漂移

| 字段 | 内容 |
|------|------|
| **级别** | IMPL（ARCH / DESIGN / IMPL） |
| **位置** | `src/core/init.ts:16`（`SPARROW_VERSION = '0.3.0'`）；`src/core/version.ts:15`（`SPARROW_VERSION = '0.2.0'`）；`src/cli/index.ts:31`（`.version('0.3.1')`） |
| **描述** | 同一「框架版本」概念在三处以互不一致的魔法值硬编码：`package.json` 为 0.3.1，`init.ts` 硬编码 0.3.0（写入 sparrow.json 与 project.md 的 sparrowVersion），`version.ts` 硬编码 0.2.0 且注释声称「keep in sync with package.json」但已失效，`cli/index.ts` 又硬编码 0.3.1。此外 `version.ts` 导出的 `parseVersion` 未被任何模块引用，而 `cli/index.ts:190` 本地重新实现了等价函数，形成重复与死代码。`sparrow init` 会把错误版本 0.3.0 写进每个生成文档的版本元数据。（Fowler: Mysterious Name / Magic Number；一致性） |
| **对齐原则** | 宪法 §3 — 一致性 |
| **消除标准（验收）** | 1) 建立单一版本真相源（从 `package.json` 读取，或构建时注入常量）；2) 移除 `init.ts` / `version.ts` / `cli` 中重复的魔法值；3) 生成文档的 `sparrow-version` 与 `package.json` 版本一致；4) 消除 `cli/index.ts:190` 本地 `parseVersion` 与 `version.ts` 的重复（复用或删除死代码）。 |
| **风险与约束** | 涉及构建/发布链路（package.json 与 dist/bin 产物），需确认 `bin/sparrow.js` 构建后的版本注入方式；`version.ts` 若判定为死代码，删除前需确认无动态 import 引用。 |

---

### IMPL-GEN-003 — `update` 命令处理器过长且职责混杂

| 字段 | 内容 |
|------|------|
| **级别** | IMPL（ARCH / DESIGN / IMPL） |
| **位置** | `src/cli/index.ts:133-228`（`program.command('update').action(async () => { ... })`） |
| **描述** | `update` 命令的 action 回调约 95 行，承担六类职责：读取本地 package.json、`npm view` 查询远端版本、同步全局约束资产（harness）、同步插件运行时、比较版本、交互确认并执行 `npm install -g`。副作用（`console.log`、`process.exit`、`execSync`、`initializeGlobalHarness`/`initializePluginRuntimes`）与纯逻辑（版本比较）交错，版本比较逻辑内联难以独立测试。（IMPL-02: Long Function；FP-01: 副作用未分离） |
| **对齐原则** | 宪法 §3 — 简洁性 |
| **消除标准（验收）** | 1) 拆分为可命名的小函数（如 `readLocalVersion`、`fetchLatestVersion`、`compareVersions`、`syncAssets`、`performUpdate`），版本比较提取为纯函数；2) 纯逻辑（版本比较）可独立单测；3) 副作用集中在边界执行，不与纯逻辑交错。 |
| **风险与约束** | CLI 交互流程（prompt、process.exit）拆分后需保持退出码与输出文案不变；当前无测试覆盖，重构前需补行为测试锁定现有输出。 |

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-08-13 | `3f33e66` | 初版：识别 4 个 IMPL 级坏味道（IMPL-TS-001 ~ IMPL-GEN-003）。 |
| 0.2.0 | 2026-08-13 | `—` | B-T01 完成：isExecSyncTimeoutError 类型守卫；IMPL-TS-001 → 已消除。 |
| 0.3.0 | 2026-08-13 | `—` | B-T02 完成：12 处 quanlity→quality + PRD_QUALITY_PATH 常量；IMPL-GEN-001 → 已消除。 |
| 0.4.0 | 2026-08-13 | `—` | B-T03 完成：getSparrowVersion 单一真相源；IMPL-GEN-002 → 已消除。 |
| 0.5.0 | 2026-08-13 | `—` | B-T04 完成：拆分 update action + compareVersions 纯函数；IMPL-GEN-003 → 已消除。 |
