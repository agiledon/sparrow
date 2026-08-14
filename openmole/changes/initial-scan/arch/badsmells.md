# 坏味道规约文档（OpenMole Bad Smells）

**版本**：0.1.0
**状态**：草案
**依据**：OpenMole 规约摘要（见 Skill 内嵌）；change 内 [tasks.md](./tasks.md)
**修订日期**：2026-08-13

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 坏味道环节正式规约载体 |
| **统计范围** | `src/`（TypeScript，约 7000 行，含本轮重构新增 9 个文件） |
| **关联任务** | 见 [tasks.md](./tasks.md) |

---

## 1. 说明

- 条目格式见 Skill 内嵌 specification §4。
- 升版时填写修订历史「提交版本」（specification §7）。
- 本 change 的 **ARCH** 级别扫描，范围：模块化、耦合、内聚、层次、边界、演进。

> **扫描结论**：依赖图显示存在一处目录级循环依赖（`core ↔ skills`）；分层在 CLI 与 core 两个方向均被违反；多个模块级可变注册表构成隐式耦合；技能注册存在多点级联修改的僵化点。无 BD（边界）级坏味道（本项目无多限界上下文边界）。

---

## 2. 坏味道条目

### 2.0 索引与消除状态

| BS-ID | 类别 | 状态 | 说明 |
|-------|------|------|------|
| ARCH-CP-001 | 耦合性 | 未清除 | core ↔ skills 目录级循环依赖（CP-02） |
| ARCH-CP-002 | 耦合性 | 未清除 | 4 个模块级可变注册表构成隐式耦合（CP-07） |
| ARCH-LY-001 | 层次性 | 未清除 | CLI 层包含 update 业务逻辑（LY-01） |
| ARCH-CH-001 | 内聚性 | 未清除 | core/init.ts 混合检测/解析/编排/展示四类职责（CH-01） |
| ARCH-EV-001 | 演进性 | 未清除 | 新增 skill 需同步修改 4 处（EV-02） |

---

### ARCH-CP-001 — core ↔ skills 目录级循环依赖

| 字段 | 内容 |
|------|------|
| **级别** | ARCH（ARCH / DESIGN / IMPL） |
| **位置** | `src/core/init.ts:14`（`import { initializeSkills } from '../skills/index.js'`）；`src/skills/index.ts:9,11`（`import ... from '../core/config.js'`、`'../core/skill-generation.js'`）；`src/skills/{explore,arch,design,model,plan,apply,archive,harness}.ts`（均 `import { registerSkillTemplate } from '../core/skill-generation.js'`） |
| **描述** | 依赖在目录级形成环：core 层（框架引擎）的 `init.ts` 依赖 skills 层（技能模板内容）的 `initializeSkills`；而 skills 层的 8 个模板文件 + `index.ts` 又反向依赖 core 层的 `skill-generation`/`config`。即 `core → skills → core`。框架核心层与内容层相互依赖，破坏单向分层，导致二者无法独立演化、独立测试。（LargeSW: Circular Dependency） |
| **对齐原则** | 宪法 §3 — 一致性 |
| **消除标准（验收）** | 1) 打破 `core → skills` 依赖（如由顶层 cli 装配：cli 先调用 `initializeSkills` 再调用 `executeInit`，core 不再 import skills）；2) skills 层仅依赖 core 定义的注册接口，形成单向 `skills → core`；3) 依赖图无 core↔skills 环；4) `typecheck` + `build` + 现有 `node --test` 通过。 |
| **风险与约束** | `initializeSkills` 目前在 `executeInit` 内被调用（`core/init.ts`），拆分装配顺序需确保 `sparrow init` 仍先注册技能再生成文件；影响 init 时序，需回归验证 `sparrow init` 产物完整。 |

---

### ARCH-CP-002 — 隐式耦合：4 个模块级可变注册表

| 字段 | 内容 |
|------|------|
| **级别** | ARCH（ARCH / DESIGN / IMPL） |
| **位置** | `src/core/skill-generation.ts:92`（`skillTemplateRegistry`）、`src/core/adapters/index.ts:18`（`_registry`）、`src/core/skills.ts:108`（`_pluginSkills`）、`src/plugins/registry.ts:3`（`_plugins`） |
| **描述** | 模块间依赖通过 4 处模块级可变状态隐式传递：skill-generation 的模板注册表、adapters 的适配器注册表、skills 的插件技能列表、plugins 的插件列表。这些全局状态未在函数签名/接口中声明，调用方（如 `generateSkillFiles` 读 `skillTemplateRegistry`、`getOrderedSkills` 读 `_pluginSkills`）依赖隐式初始化顺序；模块重复加载或测试时状态易泄漏，依赖关系不可从类型/签名中直接推断。（DDD: Implicit Coupling） |
| **对齐原则** | 宪法 §3 — 健壮性 |
| **消除标准（验收）** | 1) 注册表改为显式注入或只读构造（如工厂返回注册表实例，而非模块级单例）；2) 调用方通过参数/构造接收依赖，不依赖模块加载副作用；3) 模块重复加载/多次初始化不产生状态累积或顺序依赖。 |
| **风险与约束** | 涉及多个模块的初始化时序（`initializeSkills` / `loadBundledPlugins` / adapters 预注册），改动面大；建议拆分为多个子步骤逐一收敛，每步回归 `typecheck` + `build` + 现有 `node --test`。 |

---

### ARCH-LY-001 — CLI 层包含 update 业务逻辑

| 字段 | 内容 |
|------|------|
| **级别** | ARCH（ARCH / DESIGN / IMPL） |
| **位置** | `src/cli/index.ts:134-200`（`readLocalVersion`、`fetchLatestVersion`、`syncAssets`、`installUpdate`） |
| **描述** | `update` 命令的业务逻辑——读取本地版本、查询 npm 远端、同步全局约束资产、同步插件运行时、执行全局安装——全部内联在 CLI 命令层。命令层（commander action）应仅负责参数解析与输出编排，版本检查/资产同步/安装属于应用服务与基础设施职责，应下沉到 core 层（如 `core/update.ts`）。此前 IMPL-B-T04 已将逻辑拆为命名函数，但仍在错误层级。（Clean Arch: Layer Misplacement） |
| **对齐原则** | 宪法 §3 — 一致性 |
| **消除标准（验收）** | 1) 提取 core 层 update 服务（如 `core/update.ts`）承载 `readLocalVersion`/`fetchLatestVersion`/`syncAssets`/`installUpdate`；2) `cli/index.ts` 的 update action 仅编排该服务与输出；3) cli 层不再直接调用 `execSync`/`initializeGlobalHarness`/`initializePluginRuntimes`；4) 输出文案与退出码逐字不变。 |
| **风险与约束** | `fetchLatestVersion`/`installUpdate` 依赖 `execSync` 与 `process.exit` 的 CLI 语义，下沉时需将退出/错误处理策略显式化（如返回 Result 或抛错由 cli 层处理）；输出文案需保持逐字一致。 |

---

### ARCH-CH-001 — core/init.ts 聚合不足

| 字段 | 内容 |
|------|------|
| **级别** | ARCH（ARCH / DESIGN / IMPL） |
| **位置** | `src/core/init.ts:44`（`detectInstalledTools`）、`:57`（`parseToolSelection`）、`:90`（`formatToolDetectionSummary`）、`:123`（`executeInit`）、`:176`（`formatInitSummary`） |
| **描述** | `core/init.ts` 一个模块承载四类不同职责：工具检测（`detectInstalledTools`）、参数解析（`parseToolSelection`）、展示格式化（`formatToolDetectionSummary`/`formatInitSummary` 返回 emoji 多行字符串）、初始化编排（`executeInit` 8 步）。展示逻辑与领域逻辑混于同一模块，任何一类职责变化都需修改 init.ts，且字符串格式化（展示）不应位于 core 层。（LargeSW: Low Cohesion） |
| **对齐原则** | 宪法 §3 — 清晰性 |
| **消除标准（验收）** | 1) 将展示格式化（`formatToolDetectionSummary`/`formatInitSummary`）移出 core（至 cli 或 presentation 模块）；2) 工具检测/解析与编排按职责拆分（detect/parse 归工具模块，`executeInit` 仅编排）；3) 单模块职责单一，展示与逻辑分离。 |
| **风险与约束** | `formatInitSummary` 被 `cli/index.ts` 直接 import，移动后需更新 import；输出文案需逐字保留。 |

---

### ARCH-EV-001 — 新增 skill 需同步修改 4 处

| 字段 | 内容 |
|------|------|
| **级别** | ARCH（ARCH / DESIGN / IMPL） |
| **位置** | `src/core/skills.ts`（`SKILLS` 数组）、`src/core/skill-generation.ts:21`（`SKILL_HARNESS_MAP`）、`src/skills/index.ts:17-24`（`registerXxx` 调用）、`src/skills/xxx.ts`（新模板文件） |
| **描述** | 新增一个核心技能需同步修改 4 处：① `SKILLS` 数组加元数据；② `SKILL_HARNESS_MAP` 加 harness 映射（若该阶段有约束资产）；③ `skills/index.ts` 的 `initializeSkills` 加 `registerXxx` 调用；④ 新建模板文件。单点变更引发多处级联修改，任一遗漏会导致技能生成不完整或 harness 引用缺失，且缺乏编译期/初始化期保护。（LargeSW: Rigidity Point） |
| **对齐原则** | 宪法 §3 — 可扩展性 |
| **消除标准（验收）** | 1) 技能注册收敛为单一描述（如每个技能模块自描述其元数据 + harness 映射，registry 自动收集）；2) 新增技能仅需新增/修改一处声明；3) 缺 harness 映射或未注册模板时编译期或初始化期 fail-fast。 |
| **风险与约束** | 需保持 8 个现有技能行为不变；与 ARCH-CP-001（core↔skills 循环）相关，建议在解决循环依赖后一并重构注册机制。 |

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-08-13 | `5a9c623` | 初版：识别 5 个 ARCH 级坏味道（ARCH-CP-001 ~ ARCH-EV-001）。 |
