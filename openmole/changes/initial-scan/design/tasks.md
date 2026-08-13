# 坏味道驱动重构任务（OpenMole Tasks）

**版本**：0.3.0
**状态**：草案
**依据**：[badsmells.md](./badsmells.md)
**修订日期**：2026-08-13

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 任务分解正式规约载体 |
| **统计范围** | `src/`（40 个 TypeScript 文件，约 7092 行） |
| **关联坏味道** | 见 [badsmells.md](./badsmells.md) |
| **级别** | DESIGN |
| **提交版本** | `3f33e66` |

---

## 1. 执行约定

- **任务来源**：本文件中的任务 **必须** 根据 **[`badsmells.md`](./badsmells.md) 的当前内容** 规划与拆分。
- **标准步骤（DESIGN 7 步）**：① 确认坏味道 / ② 识别接缝（Feathers）/ ③ 测试安全网 / ④ 解依赖 / ⑤ 应用重构 / ⑥ 回归测绿 / ⑦ **用户确认**（写操作门禁）。
- **测试安全网**：本项目 **无既有测试基建**。安全网为 `npm run typecheck`（`tsc --noEmit`）+ `npm run build`（esbuild）；纯函数/工厂提取建议补 `node --test` 最小单测。
- **范围**：单任务 diff 应对准 `badsmells.md` 中的条目 / BS-ID；若发现新坏味道，**先更新 `badsmells.md`**，再更新本文件。
- **确认门**：**每任务完成后** 由 **用户（维护者）** 确认后，方可勾选完成并进入下一任务。
- **ID 规则**：任务 ID 为 `B-T序号`；依赖关系在条目中显式写出。
- **提交版本**：升版本文件或新增修订历史行时，填写 `git rev-parse HEAD`。

### 1.1 `badsmells.md` 迭代后的同步

当 **`badsmells.md` 版本或实质性内容变化** 时，**不得** 直接假设本文件仍有效 —— 须先完成差分与修订，**更新本文件** 后再实施重构。

---

## 2. 任务模板（复制使用）

```markdown
- [ ] **B-Txx.** 标题（消除 BS-xxx：简述）
  - **依赖**：B-Tyy 或 无。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `BS-...`。
  - **涉及路径**：`path/to/file.ts` …
  - **步骤**：① 确认 / ② 识别接缝 / ③ 测试安全网 / ④ 解依赖 / ⑤ 重构 / ⑥ 回归测绿 / ⑦ 用户确认。
  - **完成定义（DoD）**：……（可观测、可测试）
  - **SDD 联动**：否
```

---

## 3. 任务 backlog

### B-T01：提取适配器工厂，消除 8 个适配器重复（消除 DESIGN-RD-001）

- [x] **B-T01.** 用工厂/共享实现消除 8 个适配器的 `formatHarnessRef`/`formatSkill`/`formatCommand` 重复
  - **依赖**：无。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `DESIGN-RD-001`。
  - **涉及路径**：
    - `src/core/adapters/{claude,opencode,cursor,codex,kiro,qoder,trae,pi}.ts` — 收敛重复实现
    - `src/core/adapters/types.ts` — 保持 `ToolCommandAdapter` 接口不变
  - **步骤**：
    ① **确认**：逐文件对比 8 个适配器，确认 `formatHarnessRef`（6 行）完全一致、`formatSkill`/`formatCommand` 除注释与 pi frontmatter 外一致、`getSkillPath`/`getCommandPath` 仅路径字符串不同。
    ② **识别接缝**：`ToolCommandAdapter` 接口是稳定接缝；各适配器的差异集中在 `toolId`、两个路径字符串、`format` 类别、`getCommandPath` 是否返回 null（kiro）、`formatCommand` frontmatter 差异（pi）。
    ③ **测试安全网**：无既有测试；先 `npm run typecheck` + `npm run build` 锁定基线，并为工厂函数补 `node --test` 用例（覆盖 8 个工具的 skill/command 输出）。
    ④ **解依赖**：将共享的 `formatHarnessRef`/`formatSkill`/`formatCommand` 抽到 `src/core/adapters/shared.ts`；定义 `createAdapter(config)` 工厂，用配置（路径、frontmatter 风格、可选差异回调）生成适配器。
    ⑤ **重构**：
       - `formatHarnessRef` 全项目保留一份定义；
       - 8 个适配器退化为声明 `toolId` + 路径 + 差异配置（kiro 的 null、pi 的 frontmatter 差异用可选回调/字段表达）；
       - `adapters/index.ts` 的注册表不变，导出名不变。
    ⑥ **回归测绿**：`npm run typecheck` + `npm run build` 通过；`node --test` 全绿；对 8 个工具各验证一次生成产物内容与重构前一致。
    ⑦ **用户确认**：用户确认后勾选完成。
  - **完成定义（DoD）**：
    - 新增 IDE 适配器无需复制 `formatSkill`/`formatCommand`/`formatHarnessRef` 样板
    - `formatHarnessRef` 全项目仅一份定义
    - 8 个现有 IDE 生成产物行为不变
  - **SDD 联动**：否

---

### B-T02：删除死代码（消除 DESIGN-RD-002）

- [x] **B-T02.** 删除 `version.ts` 整模块与 6 个零引用导出
  - **依赖**：无（但 **impl/B-T03** 依赖本任务先删 `version.ts`，见跨级别说明）。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `DESIGN-RD-002`。
  - **涉及路径**：
    - `src/core/version.ts` — 整模块（97 行）
    - `src/core/config.ts:92`（`getToolById`）、`src/core/config.ts:219`（`getSkillById`）
    - `src/core/project-md.ts:109`（`getProjectMdPath`）、`src/core/project-md.ts:117`（`getProjectMdUpdateBlock`）
    - `src/core/adapters/index.ts:57`（`getRegisteredToolIds`）、`src/core/adapters/index.ts:64`（`hasAdapter`）
  - **步骤**：
    ① **确认**：`grep -rn` 确认 `version.ts` 导出与上述 6 个函数全项目零引用（仅定义处出现）。
    ② **识别接缝**：这些符号无调用方，接缝即「导出边界」——删除后需确认无动态 import、无构建/发布脚本、无外部消费者引用。
    ③ **测试安全网**：`npm run typecheck` + `npm run build` 通过（删除死代码不应破坏编译）。
    ④ **解依赖**：确认 `src/plugins/index.ts`、`bin/sparrow.js` 打包入口不间接引用；`grep -rn "core/version"` 全项目为空。
    ⑤ **重构**：删除 `version.ts` 文件；移除 6 个零引用导出函数（若有意保留 `getRegisteredToolIds`/`hasAdapter`，则补文档说明并转为实际使用，否则删除）。
    ⑥ **回归测绿**：`npm run typecheck` + `npm run build` 通过；`node bin/sparrow.js --help` 正常。
    ⑦ **用户确认**：用户确认后勾选完成。
  - **完成定义（DoD）**：
    - `src/core/version.ts` 已删除（或明确保留理由）
    - 6 个零引用导出已删除或获得实际调用方
    - `npm run build` 通过且 `dist/`、`bin/sparrow.js` 产物正常
  - **SDD 联动**：否

---

### B-T03：引入参数对象消除 Data Clump（消除 DESIGN-BS-001）

- [ ] **B-T03.** 用参数对象统一 `generateProjectConfig`/`generateProjectMd` 的 4 参数团
  - **依赖**：无。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `DESIGN-BS-001`。
  - **涉及路径**：
    - `src/core/skill-generation.ts:201`（`generateProjectConfig`）、`src/core/skill-generation.ts:239`（`generateProjectMd`）
    - `src/core/init.ts:142-145`（调用点 `executeInit`）
  - **步骤**：
    ① **确认**：确认两函数共享 `(projectRoot, projectName, version, toolIds)` 且参数顺序不一致，`version`/`sparrowVersion` 命名不一致。
    ② **识别接缝**：两函数均为内部调用（仅 `init.ts` 调用），接缝清晰，可安全改签名。
    ③ **测试安全网**：`npm run typecheck` + `npm run build` 锁定基线。
    ④ **解依赖**：定义 `ProjectContext { projectRoot: string; projectName: string; version: string; toolIds: string[] }`（置于 `skill-generation.ts` 或 `init.ts` 附近）。
    ⑤ **重构**：
       - `generateProjectConfig(ctx)` 与 `generateProjectMd(ctx)` 改为单对象参数，内部解构；
       - 统一 `version` 命名（与 impl/B-T03 的 `readPackageVersion` 结果对齐）；
       - `executeInit` 构造 `ProjectContext` 一次，不再手工拆散传递 4 个标量。
    ⑥ **回归测绿**：`npm run typecheck` + `npm run build` 通过；`node bin/sparrow.js init --tools claude --force` 生成产物正常。
    ⑦ **用户确认**：用户确认后勾选完成。
  - **完成定义（DoD）**：
    - 两函数签名收敛为单参数对象，参数顺序歧义消除
    - `version`/`sparrowVersion` 命名统一
    - `executeInit` 不再手工拆散传递 4 个标量
  - **SDD 联动**：否

---

### B-T04：拆分 config.ts 职责（消除 DESIGN-DF-001）

- [ ] **B-T04.** 将 config.ts 的工具注册表、技能注册表、插件技能状态拆分到独立模块
  - **依赖**：建议先完成 B-T02（移除 `getToolById`/`getSkillById` 死导出，减少拆分面）。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `DESIGN-DF-001`。
  - **涉及路径**：
    - `src/core/config.ts` — 拆分（`ToolDefinition`+`SUPPORTED_TOOLS` / `SkillDefinition`+`SKILLS` / `_pluginSkills`+`registerPluginSkills`）
    - 所有 import `config.js` 的调用方：`src/core/init.ts`、`src/core/prompts.ts`、`src/core/skill-generation.ts`、`src/skills/index.ts`、`src/cli/index.ts`
  - **步骤**：
    ① **确认**：确认 `config.ts` 承载三类职责，且 `_pluginSkills`/`_pluginSkillsRegistered` 为模块级可变状态。
    ② **识别接缝**：导出符号（`SUPPORTED_TOOLS`、`getSupportedToolIds`、`SKILLS`、`getOrderedSkills`、`registerPluginSkills`）是稳定接缝；拆分时保持导出名兼容可最小化调用方改动。
    ③ **测试安全网**：`npm run typecheck` + `npm run build` 锁定基线。
    ④ **解依赖**：新建 `src/core/tools.ts`（工具注册表）与 `src/core/skills.ts`（技能注册表）；`config.ts` 保留聚合再导出（re-export）以兼容现有 import。
    ⑤ **重构**：
       - 将 `SUPPORTED_TOOLS`/`getToolById`/`getSupportedToolIds` 迁入 `tools.ts`；
       - 将 `SKILLS`/`getSkillById`/`getOrderedSkills`/`registerPluginSkills` 迁入 `skills.ts`；
       - 插件技能状态改为显式注入或纯函数组合（`getOrderedSkills(extraSkills?)`），移除 `_pluginSkillsRegistered` 布尔幂等标志；
       - 更新 `skills/index.ts` 中 `registerPluginSkills` 调用为无状态组合。
    ⑥ **回归测绿**：`npm run typecheck` + `npm run build` 通过；`node bin/sparrow.js init --tools claude --force` 重复执行不产生重复注册/状态累积。
    ⑦ **用户确认**：用户确认后勾选完成。
  - **完成定义（DoD）**：
    - 工具注册表与技能注册表位于独立模块，`config.ts` 仅聚合再导出
    - `_pluginSkillsRegistered` 布尔幂等标志已移除
    - 模块重复加载不产生状态累积或重复注册
  - **SDD 联动**：否

---

### B-T05：插件版本号收敛为单一真相源（消除 DESIGN-RD-003）

- [ ] **B-T05.** 删除 `BUNDLED_PLUGIN_VERSIONS`，插件版本从 `plugin.json` 单一读取，并去重 `load.ts` 注册块
  - **依赖**：无。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `DESIGN-RD-003`。
  - **涉及路径**：
    - `src/plugins/registry.ts:3-6`（`BUNDLED_PLUGIN_VERSIONS`）
    - `src/plugins/load.ts:8-19`（重复的 `registerBundledPlugin` 调用）
    - `src/plugins/bundled/{archify,sparrow-ui}/index.ts`（两个完全相同的文件）
  - **步骤**：
    ① **确认**：确认 `BUNDLED_PLUGIN_VERSIONS` 与各 `plugin.json` 的 `version` 字段重复且需手工同步；确认 `load.ts` 两个注册块复制粘贴；确认两个 `index.ts` 内容相同。
    ② **识别接缝**：`Plugin` 类型与 `registerBundledPlugin` 是稳定接缝；`BUNDLED_PLUGIN_VERSIONS` 若被外部引用需先确认。
    ③ **测试安全网**：`npm run typecheck` + `npm run build` 锁定基线。
    ④ **解依赖**：确认 `BUNDLED_PLUGIN_VERSIONS` 无外部引用（`grep -rn` 仅 registry.ts 内出现）。
    ⑤ **重构**：
       - 删除 `BUNDLED_PLUGIN_VERSIONS`，版本以 `plugin.json` 的 `version` 为唯一来源；
       - `load.ts` 用循环/数组映射（`for (const p of [archify, sparrowUi]) registerBundledPlugin(...)`）代替两份重复注册块；
       - 审视 `as Plugin` 类型断言，若 JSON 导入与 `Plugin` 结构存在差异则用显式构造替代断言。
    ⑥ **回归测绿**：`npm run typecheck` + `npm run build` 通过；`node bin/sparrow.js init --tools claude --force` 插件加载正常。
    ⑦ **用户确认**：用户确认后勾选完成。
  - **完成定义（DoD）**：
    - `BUNDLED_PLUGIN_VERSIONS` 已删除，版本唯一来源为 `plugin.json`
    - `load.ts` 无复制粘贴的重复注册块（循环/映射代替）
    - 新增插件无需新增版本常量或复制注册块
  - **SDD 联动**：否

---

## 4. 执行顺序

```
B-T02 (删死代码) ──→ B-T04 (拆分 config.ts，移除死导出后拆分面更小)
       └──────────────→ impl/B-T03 (版本真相源，需先删 version.ts)

B-T01 (适配器工厂) ── 可独立执行
B-T03 (参数对象)   ── 可独立执行
B-T05 (插件版本)   ── 可独立执行
```

> **跨级别说明**：`design/B-T02`（删除 version.ts 死代码）应先于 `impl/B-T03`（版本真相源），两任务都涉及 `src/core/version.ts`。`design/B-T03`（参数对象）与 `impl/B-T03` 都收敛版本来源，建议 design/B-T03 的 `ProjectContext.version` 复用 impl/B-T03 的 `readPackageVersion` 结果。

---

## 5. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-08-13 | `3f33e66` | 初版：5 个任务 B-T01 ~ B-T05，覆盖 design/badsmells.md 全部未清除条目。 |
| 0.2.0 | 2026-08-13 | `—` | B-T02 完成：删除 version.ts 死代码 + 6 个零引用导出；DESIGN-RD-002 → 已消除。 |
| 0.3.0 | 2026-08-13 | `—` | B-T01 完成：新建 shared.ts 工厂 + 单一 formatHarnessRef；8 适配器退化为配置声明；DESIGN-RD-001 → 已消除。 |
