# 坏味道驱动重构任务（OpenMole Tasks）

**版本**：0.6.0
**状态**：草案
**依据**：[badsmells.md](./badsmells.md)
**修订日期**：2026-08-13

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 任务分解正式规约载体 |
| **统计范围** | `src/`（TypeScript，约 7000 行） |
| **关联坏味道** | 见 [badsmells.md](./badsmells.md) |
| **级别** | ARCH |
| **提交版本** | `5a9c623` |

---

## 1. 执行约定

- **任务来源**：本文件中的任务 **必须** 根据 **[`badsmells.md`](./badsmells.md) 的当前内容** 规划与拆分。
- **标准步骤（ARCH 8 步）**：① 确认坏味道 / ② 影响分析 / ③ 测试安全网 / ④ 选择架构模式 / ⑤ 迁移计划 / ⑥ 增量执行 / ⑦ 回归测绿 / ⑧ **用户确认**（写操作门禁）。
- **测试安全网**：`npm run typecheck` + `npm run build` + 现有 `node --test`（10 用例）+ `sparrow init --tools claude --force` 冒烟。
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
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `BS-...`。
  - **涉及路径**：`path/to/file.ts` …
  - **步骤**：① 确认 / ② 影响分析 / ③ 测试安全网 / ④ 选择架构模式 / ⑤ 迁移计划 / ⑥ 增量执行 / ⑦ 回归测绿 / ⑧ 用户确认。
  - **完成定义（DoD）**：……（可观测、可测试）
  - **SDD 联动**：否
```

---

## 3. 任务 backlog

### B-T01：打破 core↔skills 循环依赖（消除 ARCH-CP-001）

- [x] **B-T01.** 将 `initializeSkills` 装配上移到 cli 层，消除 `core → skills → core` 循环
  - **依赖**：无。
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `ARCH-CP-001`。
  - **涉及路径**：
    - `src/core/init.ts:14` — 移除 `import { initializeSkills } from '../skills/index.js'`
    - `src/core/init.ts:123` — `executeInit` 移除 `initializeSkills()` 调用
    - `src/cli/index.ts` — init action 在 `executeInit` 前调用 `initializeSkills`（装配根）
    - `src/skills/index.ts` — 保持注册逻辑不变
  - **步骤**：
    ① **确认**：依赖图存在 `core/init → skills/index → core/skill-generation` 环。
    ② **影响分析**：`initializeSkills` 现由 `executeInit` 内部调用，上移后 `sparrow init` 时序变为「cli 先注册技能，再 executeInit」；影响 init 命令与 8 个技能注册；不改变生成产物。
    ③ **测试安全网**：`npm run typecheck` + `npm run build` + `node --test`（10 用例）锁定基线；`sparrow init --tools claude --force` 冒烟产物完整。
    ④ **选择架构模式**：**装配根（Composition Root）** —— cli 层作为唯一装配点，`core` 不再反向依赖 `skills`，形成单向 `skills → core`。
    ⑤ **迁移计划**：① 从 `core/init.ts` 移除 `initializeSkills` import 与调用；② cli init action 顶部先 `initializeSkills()` 再 `executeInit(...)`；③ 保持 `executeInit` 其余 7 步不变。
    ⑥ **增量执行**：按 ①②③ 顺序逐条落地。
    ⑦ **回归测绿**：`typecheck` + `build` + `node --test` + `sparrow init --tools claude --force` 冒烟。
    ⑧ **用户确认**。
  - **完成定义（DoD）**：
    - 依赖图无 `core → skills` 环（`grep -rn "skills/index" src/core` 为空）
    - `core/init.ts` 不再 import skills；`skills` 仅单向依赖 core
    - `sparrow init` 生成产物与重构前完全一致
  - **SDD 联动**：否

---

### B-T02：注册表显式注入，消除隐式耦合（消除 ARCH-CP-002）

- [x] **B-T02.** 将 4 个模块级可变注册表改为显式注入/只读构造
  - **依赖**：B-T01（循环打破后，注册表装配点更清晰）。
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `ARCH-CP-002`。
  - **涉及路径**：
    - `src/core/skill-generation.ts:92`（`skillTemplateRegistry`）
    - `src/core/adapters/index.ts:18`（`_registry`）
    - `src/core/skills.ts:108`（`_pluginSkills`）
    - `src/plugins/registry.ts:3`（`_plugins`）
  - **步骤**：
    ① **确认**：4 处模块级可变状态承载跨模块依赖，未在签名声明。
    ② **影响分析**：`generateSkillFiles` 读 `skillTemplateRegistry`、`getOrderedSkills` 读 `_pluginSkills`、`getAdapter` 读 `_registry`、`getBundledPlugins` 读 `_plugins`；改造需保持这些读取方行为不变。
    ③ **测试安全网**：`typecheck` + `build` + `node --test` 锁定基线。
    ④ **选择架构模式**：**依赖注入 / 只读注册表** —— 工厂函数返回注册表实例，或模块加载期只读构造（`Object.freeze`），调用方经参数/构造接收。
    ⑤ **迁移计划**：① 逐一定位 4 处注册表；② 将可变单例改为工厂/只读；③ 调用方改为显式传入；④ 每改一处回归一次。
    ⑥ **增量执行**：按注册表逐个收敛（先 `_registry`/`_plugins`，再 `skillTemplateRegistry`/`_pluginSkills`）。
    ⑦ **回归测绿**：`typecheck` + `build` + `node --test` + `sparrow init` 冒烟；验证重复 `initializeSkills` 不累积。
    ⑧ **用户确认**。
  - **完成定义（DoD）**：
    - 无模块级可变单例（注册表经参数/构造注入或只读构造）
    - 模块重复加载/多次初始化不产生状态累积或顺序依赖
    - 8 个技能 + 2 个插件的生成/加载行为不变
  - **SDD 联动**：否

---

### B-T03：update 业务逻辑下沉 core 层（消除 ARCH-LY-001）

- [x] **B-T03.** 提取 `core/update.ts` 承载 update 命令业务逻辑，cli 层仅编排
  - **依赖**：无。
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `ARCH-LY-001`。
  - **涉及路径**：
    - `src/cli/index.ts:134-200`（`readLocalVersion`/`fetchLatestVersion`/`syncAssets`/`installUpdate`）
    - `src/core/update.ts` — **新建**
  - **步骤**：
    ① **确认**：update 业务逻辑内联于 cli 命令层。
    ② **影响分析**：4 个函数依赖 `execSync`/`initializeGlobalHarness`/`initializePluginRuntimes`/`process.exit`；下沉时需显式化错误/退出策略。
    ③ **测试安全网**：`typecheck` + `build` + `node --test` 锁定基线。
    ④ **选择架构模式**：**分层（Layered）** —— cli（表示层）→ core（应用服务）→ harness/plugins（基础设施）。
    ⑤ **迁移计划**：① 新建 `core/update.ts`，迁入 4 个函数，`process.exit` 改为抛错/返回状态由 cli 层处理；② cli update action 改为调用 `core/update` 服务并处理输出；③ 保持输出文案与退出码逐字一致。
    ⑥ **增量执行**：按函数逐个迁移。
    ⑦ **回归测绿**：`typecheck` + `build` + `node --test` + `node bin/sparrow.js update`（含超时/跳过/失败路径）冒烟。
    ⑧ **用户确认**。
  - **完成定义（DoD）**：
    - cli 层不再直接调用 `execSync`/`initializeGlobalHarness`/`initializePluginRuntimes`
    - `core/update.ts` 承载版本检查/同步/安装职责
    - update 输出文案与退出码与重构前逐字一致
  - **SDD 联动**：否

---

### B-T04：init.ts 职责拆分，展示与逻辑分离（消除 ARCH-CH-001）

- [x] **B-T04.** 将 `core/init.ts` 的展示格式化移出 core，检测/解析/编排按职责拆分
  - **依赖**：B-T01（init.ts 拆分与循环打破都触碰 init.ts）。
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `ARCH-CH-001`。
  - **涉及路径**：
    - `src/core/init.ts:90`（`formatToolDetectionSummary`）、`:176`（`formatInitSummary`）
    - `src/cli/index.ts` — import 更新（`formatInitSummary`/`formatToolDetectionSummary`）
  - **步骤**：
    ① **确认**：init.ts 混合检测/解析/编排/展示四类职责。
    ② **影响分析**：`formatInitSummary` 被 cli init action import；移动后更新 import；输出文案需逐字保留。
    ③ **测试安全网**：`typecheck` + `build` + `node --test` 锁定基线。
    ④ **选择架构模式**：**表示与领域分离** —— 展示字符串归 cli/presentation，检测/解析归工具模块，`executeInit` 仅编排。
    ⑤ **迁移计划**：① 新建 presentation 模块（如 `src/cli/summary.ts`）承载两个 format 函数；② 更新 cli import；③ 检测/解析函数按需迁至 `tools` 相关模块；④ `executeInit` 仅保留编排。
    ⑥ **增量执行**：先迁展示函数，再拆分检测/解析。
    ⑦ **回归测绿**：`typecheck` + `build` + `node --test` + `sparrow init` 冒烟，输出逐字一致。
    ⑧ **用户确认**。
  - **完成定义（DoD）**：
    - `formatToolDetectionSummary`/`formatInitSummary` 不在 `core/init.ts`
    - `core/init.ts` 仅负责编排（或职责单一）
    - init 输出文案与重构前逐字一致
  - **SDD 联动**：否

---

### B-T05：技能注册收敛为单一描述（消除 ARCH-EV-001）

- [x] **B-T05.** 收敛技能元数据与 harness 映射，使新增技能仅需一处声明
  - **依赖**：B-T01（循环打破后，skills 单向依赖 core，注册机制可收敛）。
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `ARCH-EV-001`。
  - **涉及路径**：
    - `src/core/skills.ts`（`SKILLS` 数组）
    - `src/core/skill-generation.ts:21`（`SKILL_HARNESS_MAP`）
    - `src/skills/index.ts:17-24`（`registerXxx` 调用）
    - `src/skills/{explore,arch,design,model,plan,apply,archive,harness}.ts`
  - **步骤**：
    ① **确认**：新增技能需改 4 处。
    ② **影响分析**：8 个现有技能分布 4 处；收敛需保持 8 技能元数据 + harness 映射 + 模板注册完整。
    ③ **测试安全网**：`typecheck` + `build` + `node --test` + `sparrow init` 冒烟（8 技能全量生成）。
    ④ **选择架构模式**：**自描述注册表** —— 每个技能模块导出单一描述（含元数据 + harness 映射 + 模板），registry 自动收集，无需手工 register 列表。
    ⑤ **迁移计划**：① 定义统一技能描述接口（含 id/phase/order/harness/template）；② 8 个技能模块改为导出该描述；③ `skills/index.ts` 改为遍历收集 + 自动注册；④ 删除 `SKILL_HARNESS_MAP` 与手工 register 列表；⑤ 缺 harness/未注册时 fail-fast。
    ⑥ **增量执行**：逐技能迁移（先 2 个试点，再铺开）。
    ⑦ **回归测绿**：`typecheck` + `build` + `node --test` + `sparrow init` 冒烟（8 技能产物逐字一致）。
    ⑧ **用户确认**。
  - **完成定义（DoD）**：
    - 新增技能仅需新增/修改一处声明
    - `SKILL_HARNESS_MAP` 与手工 `registerXxx` 列表消除
    - 缺 harness 映射或未注册模板时初始化期 fail-fast
    - 8 个现有技能生成产物不变
  - **SDD 联动**：否

---

## 4. 执行顺序

```
B-T01 (打破循环依赖) ──→ B-T02 (注册表注入)
       ├───────────────→ B-T04 (init.ts 拆分)
       └───────────────→ B-T05 (技能注册收敛)

B-T03 (update 下沉 core) — 可独立执行
```

**推荐**：先 B-T01（架构根因）→ B-T05（与 B-T01 强相关）→ B-T02 → B-T04；B-T03 可随时并行。

---

## 5. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-08-13 | `5a9c623` | 初版：5 个任务 B-T01 ~ B-T05，覆盖 arch/badsmells.md 全部未清除条目。 |
| 0.2.0 | 2026-08-13 | `—` | B-T01 完成：initializeSkills 上移 cli 装配根；core→skills 循环消除；ARCH-CP-001 → 已消除。 |
| 0.3.0 | 2026-08-13 | `—` | B-T05 完成：自描述 SkillSpec + 注册表收集，消除 SKILL_HARNESS_MAP 与 registerXxx 列表；ARCH-EV-001 → 已消除。 |
| 0.4.0 | 2026-08-13 | `—` | B-T03 完成：update 业务下沉 core/update.ts + UpdateError；cli 层仅编排；ARCH-LY-001 → 已消除。 |
| 0.5.0 | 2026-08-13 | `—` | B-T04 完成：展示迁至 cli/summary.ts，检测/解析迁至 tools.ts，init.ts 仅编排；ARCH-CH-001 → 已消除。 |
| 0.6.0 | 2026-08-13 | `—` | B-T02 完成：SkillRegistry 显式注入 + 插件去重；ARCH-CP-002 → 已消除。 |
