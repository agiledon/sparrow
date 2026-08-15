# 坏味道规约文档（OpenMole Bad Smells）

**版本**：0.6.0
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
- 本 change 的 **DESIGN** 级别扫描，范围：封装、继承、模块化、冗余（Fowler 主 + PHAME 补）。

> **扫描结论**：本项目为接口 + 对象字面量风格，无类继承层次（无 IH 类坏味道）；模块依赖图无环（无 MO-02 循环依赖）。设计级问题集中在**冗余（重复/死代码）**与**模块职责混杂**。

---

## 2. 坏味道条目

### 2.0 索引与消除状态

| BS-ID | 类别 | 状态 | 说明 |
|-------|------|------|------|
| DESIGN-RD-001 | 冗余 | 已消除 | 8 个工具适配器重复实现 formatHarnessRef/formatSkill/formatCommand（RD-01） |
| DESIGN-RD-002 | 冗余 | 已消除 | version.ts 整体死代码 + 6 个未使用导出（RD-02） |
| DESIGN-BS-001 | 膨胀 | 已消除 | generateProjectConfig/Md 共享 4 参数团 + 长参数列表（BS-04/BS-02） |
| DESIGN-DF-001 | 设计缺陷 | 已消除 | config.ts 混合两注册表 + 模块级可变状态（DF-01/MO-01） |
| DESIGN-RD-003 | 冗余 | 已消除 | 插件版本号双真相源 + 重复注册（RD-01） |

---

### DESIGN-RD-001 — 8 个工具适配器重复实现

| 字段 | 内容 |
|------|------|
| **级别** | DESIGN（ARCH / DESIGN / IMPL） |
| **位置** | `src/core/adapters/{claude,opencode,cursor,codex,kiro,qoder,trae,pi}.ts`（各文件的 `formatHarnessRef`、`formatSkill`、`formatCommand`） |
| **描述** | 8 个适配器中的 `formatHarnessRef`（各 6 行）完全一致，`formatSkill` 与 `formatCommand` 除注释与 pi 的 frontmatter 差异外完全一致；`getSkillPath`/`getCommandPath` 仅路径字符串不同。每新增一个 IDE 适配器都需复制粘贴约 50 行样板代码，目前累计约 8 × 50 = 400 行重复，且未来维护（如统一 frontmatter 格式）需同步修改 8 处。（Fowler: Duplicated Code；PHAME: Duplicate Abstraction） |
| **对齐原则** | 宪法 §3 — 复用性 |
| **消除标准（验收）** | 1) 提取共享实现（如工厂 `createAdapter(toolId, paths, frontmatterStyle)` 或基类），8 个适配器退化为仅声明 `toolId` + 路径 + 差异配置；2) 新增 IDE 适配器时无需复制 `formatSkill`/`formatCommand`/`formatHarnessRef` 样板；3) `formatHarnessRef` 全项目仅保留一份定义；4) 现有 8 个 IDE 生成产物行为不变。 |
| **风险与约束** | pi 的 `formatCommand` frontmatter 与其余 7 个不同（仅 description），工厂需支持可选差异回调；kiro 的 `getCommandPath` 返回 `null`（从 skills 目录发现命令），需保留该差异能力；改动后需对全部 8 个工具回归验证生成文件内容。 |

---

### DESIGN-RD-002 — version.ts 整体死代码 + 多个未使用导出

| 字段 | 内容 |
|------|------|
| **级别** | DESIGN（ARCH / DESIGN / IMPL） |
| **位置** | `src/core/version.ts`（整模块 97 行）；`src/core/config.ts:92`（`getToolById`）、`src/core/config.ts:219`（`getSkillById`）；`src/core/project-md.ts:109`（`getProjectMdPath`）、`src/core/project-md.ts:117`（`getProjectMdUpdateBlock`）；`src/core/adapters/index.ts:57`（`getRegisteredToolIds`）、`src/core/adapters/index.ts:64`（`hasAdapter`） |
| **描述** | `version.ts` 导出的 `SPARROW_VERSION`、`parseVersion`、`incrementVersion`、`formatVersion`、`generateVersionBlock`、`getVersionManagementBlock` 均未被任何模块 import（`SPARROW_VERSION` 与 `parseVersion` 在 `init.ts`/`cli/index.ts` 中被本地重新定义而非引用）。另有 `getToolById`、`getSkillById`、`getProjectMdPath`、`getProjectMdUpdateBlock`、`getRegisteredToolIds`、`hasAdapter` 六个导出函数全项目零引用。死代码增加认知负担与维护成本，且 `version.ts` 中已失效的 `SPARROW_VERSION = '0.2.0'` 会误导后续开发者。（Fowler: Dead Code） |
| **对齐原则** | 宪法 §3 — 简洁性 |
| **消除标准（验收）** | 1) 删除 `version.ts` 整模块（若确认无动态 import/构建引用）；2) 删除或移除上述 6 个零引用导出；3) `tsc --noEmit` 通过（`noUnusedLocals` 开启下无告警）；4) 若 `getRegisteredToolIds`/`hasAdapter` 有意对外保留，需补充文档说明或实际调用方。 |
| **风险与约束** | 删除前需确认 `bin/sparrow.js`（esbuild 打包产物）与外部消费者不依赖这些导出；`version.ts` 若未来有意复用（版本元数据管理），需先设计单一真相源再决定去留；建议在 `git` 中留可追溯历史。 |

---

### DESIGN-BS-001 — generateProjectConfig/Md 共享参数团与长参数列表

| 字段 | 内容 |
|------|------|
| **级别** | DESIGN（ARCH / DESIGN / IMPL） |
| **位置** | `src/core/skill-generation.ts:201`（`generateProjectConfig(projectRoot, toolIds, version, projectName)`）、`src/core/skill-generation.ts:239`（`generateProjectMd(projectRoot, projectName, sparrowVersion, toolIds)`） |
| **描述** | 两个函数共享同一组 4 个参数 `(projectRoot, projectName, version, toolIds)`，且参数顺序不一致（一个 `toolIds` 在前、一个 `projectName` 在前），调用方 `executeInit`（`src/core/init.ts:142-145`）需按不同顺序传参。同一组数据在多个函数间结对传递，是典型 Data Clump；`version` 与 `sparrowVersion` 实为同一概念却命名不同。（Fowler: Data Clump + Long Parameter List） |
| **对齐原则** | 宪法 §3 — 清晰性 |
| **消除标准（验收）** | 1) 引入一个参数对象（如 `ProjectContext { projectRoot; projectName; version; toolIds }`）统一承载这组数据；2) `generateProjectConfig` 与 `generateProjectMd` 签名收敛为一致顺序或单对象参数；3) 统一 `version`/`sparrowVersion` 命名；4) `executeInit` 不再手工拆散传递 4 个标量。 |
| **风险与约束** | 两函数均被 `init.ts` 调用，改动集中在签名与调用点；参数对象需在 `InitOptions`/`InitResult` 附近定义，避免与既有 `InitOptions` 混淆；纯签名重构，无行为变化，但需同步更新类型。 |

---

### DESIGN-DF-001 — config.ts 职责混杂与模块级可变状态

| 字段 | 内容 |
|------|------|
| **级别** | DESIGN（ARCH / DESIGN / IMPL） |
| **位置** | `src/core/config.ts`（`ToolDefinition`+`SUPPORTED_TOOLS` 1-100 行、`SkillDefinition`+`SKILLS` 103-205 行、`_pluginSkills`/`_pluginSkillsRegistered` 207-213 行、`registerPluginSkills` 210 行） |
| **描述** | 名为「config」的模块实际承载了三类不同职责：① 工具注册表（`SUPPORTED_TOOLS`）② 技能注册表（`SKILLS`）③ 插件技能的模块级可变状态（`_pluginSkills` + `_pluginSkillsRegistered` 标志位）。「新增一个工具」与「新增一个技能」这两个不同变更原因会修改同一模块（Divergent Change）；`_pluginSkillsRegistered` 用布尔标志做幂等保护，是脆弱的全局可变状态（模块被多次加载/测试时状态易泄漏）。（Fowler: Divergent Change；PHAME: Insufficient Modularization） |
| **对齐原则** | 宪法 §3 — 一致性 |
| **消除标准（验收）** | 1) 将工具注册表与技能注册表拆分到独立模块（如 `tools.ts` / `skills.ts`），`config.ts` 仅保留聚合或只读入口；2) 插件技能状态改为显式注入或纯函数组合（如 `getOrderedSkills(extraSkills)`），移除 `_pluginSkillsRegistered` 布尔幂等标志；3) 模块加载多次不产生状态累积或重复注册。 |
| **风险与约束** | 多处模块 import `config.js` 的 `SUPPORTED_TOOLS`/`SKILLS`，拆分需保持导出名兼容或一次性更新 import；`registerPluginSkills` 的幂等语义目前被 `skills/index.ts` 依赖，移除标志前需确认不会在 `sparrow init` 中重复注册插件技能。 |

---

### DESIGN-RD-003 — 插件版本号双真相源与重复注册

| 字段 | 内容 |
|------|------|
| **级别** | DESIGN（ARCH / DESIGN / IMPL） |
| **位置** | `src/plugins/registry.ts:3-6`（`BUNDLED_PLUGIN_VERSIONS`）；`src/plugins/bundled/archify/plugin.json`、`src/plugins/bundled/sparrow-ui/plugin.json`（`version` 字段）；`src/plugins/load.ts:8-19`（两次重复的 `registerBundledPlugin` 调用）；`src/plugins/bundled/{archify,sparrow-ui}/index.ts`（两个完全相同的文件） |
| **描述** | 插件版本号存在两处真相源：`registry.ts` 的 `BUNDLED_PLUGIN_VERSIONS = { archify: '2.13.0', 'sparrow-ui': '2.13.0' }` 与各 `plugin.json` 的 `version: '2.13.0'`，二者需手工保持同步，漂移即产生错误。`load.ts` 对两个插件复制粘贴了完全相同的注册块（`manifest` + `skillContent` + `augmentContents`）；`archify/index.ts` 与 `sparrow-ui/index.ts` 内容完全相同（均为 import 后 re-export）。（Fowler: Duplicated Code） |
| **对齐原则** | 宪法 §3 — 一致性 |
| **消除标准（验收）** | 1) 插件版本号收敛为单一真相源（`plugin.json`），删除或派生 `BUNDLED_PLUGIN_VERSIONS`；2) `load.ts` 用循环/映射代替两次重复的注册块（如 `for (const p of [archify, sparrowUi])`）；3) `archify/index.ts` 与 `sparrow-ui/index.ts` 去重（或合并为统一的插件加载约定）；4) 新增插件时无需新增版本常量或复制注册块。 |
| **风险与约束** | `BUNDLED_PLUGIN_VERSIONS` 若被外部（构建/发布脚本）引用，删除前需确认引用方；`as Plugin` 类型断言在重构时应一并审视，避免用断言掩盖 JSON 导入与 `Plugin` 类型的结构差异。 |

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-08-13 | `3f33e66` | 初版：识别 5 个 DESIGN 级坏味道（DESIGN-RD-001 ~ DESIGN-RD-003、DESIGN-BS-001、DESIGN-DF-001）。 |
| 0.2.0 | 2026-08-13 | `—` | B-T02 完成：删除 version.ts 死代码 + 6 个零引用导出；DESIGN-RD-002 → 已消除。 |
| 0.3.0 | 2026-08-13 | `—` | B-T01 完成：shared.ts 工厂 + 单一 formatHarnessRef；DESIGN-RD-001 → 已消除。 |
| 0.4.0 | 2026-08-13 | `—` | B-T03 完成：ProjectContext 参数对象；DESIGN-BS-001 → 已消除。 |
| 0.5.0 | 2026-08-13 | `—` | B-T05 完成：删除 BUNDLED_PLUGIN_VERSIONS + load.ts 循环去重；DESIGN-RD-003 → 已消除。 |
| 0.6.0 | 2026-08-13 | `—` | B-T04 完成：拆分 tools.ts/skills.ts + 移除幂等标志；DESIGN-DF-001 → 已消除。 |
