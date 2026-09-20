# 坏味道驱动重构任务（OpenMole Tasks）

**版本**：0.1.0
**状态**：草案
**依据**：[badsmells.md](./badsmells.md)
**修订日期**：2026-09-20

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 任务分解正式规约载体 |
| **统计范围** | `src/` + `sparrow-state.mjs` 模板 |
| **关联坏味道** | 见 [badsmells.md](./badsmells.md) |
| **级别** | ARCH |
| **提交版本** | `fe8c2cc` |

---

## 1. 执行约定

- **任务来源**：必须根据 [`badsmells.md`](./badsmells.md) 当前内容规划。
- **标准步骤（ARCH 8 步）**：① 确认坏味道 / ② 影响分析 / ③ 测试安全网 / ④ 选择架构模式 / ⑤ 迁移计划 / ⑥ 增量执行 / ⑦ 回归测绿 / ⑧ **用户确认**。
- **测试安全网**：`npm run typecheck` + `npm test`（含 `project-state` / `spec-promote`）。
- **确认门**：每任务完成后由用户确认方可勾选并进入下一任务。
- **执行顺序建议**：B-T01 → B-T02 → B-T03 → B-T04（先统一真相源，再拆模块，再暴露 promote，最后收敛文档僵化）。

---

## 2. 任务 backlog

### B-T01：统一 state/archive 判定单一实现源（消除 ARCH-CP-001）

- [x] **B-T01.** 消除 `project-state.ts` 与 `sparrow-state.mjs` 双轨复制
  - **依赖**：无。
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `ARCH-CP-001`。
  - **涉及路径**：`src/core/project-state.ts`；`src/schemas/templates/shared/scripts/sparrow-state.mjs`；可选 `scripts/` 生成管道；`src/core/spec-paths.ts`
  - **步骤**：
    ① **确认**：normalize / detectMode / checkArchive / 常量表双份存在。
    ② **影响分析**：用户项目经 `sparrow init/update` 获得脚本；skill 调用 mjs；测试调用 TS。改生成策略影响所有已安装项目刷新路径。
    ③ **测试安全网**：现有 `project-state.test.ts` + 新增「生成脚本与 core 契约一致」断言（或金样）。
    ④ **选择架构模式**：**单一真相源 + 生成物**（TS core 为源，构建/同步吐出 mjs）或 **薄 CLI 包装调用已发布 API**（若可接受运行时依赖）。
    ⑤ **迁移计划**：① 选定模式；② 抽共享契约（完成判定、常量）；③ 生成或删除 mjs 手写副本；④ `sync-schema`/init 路径验证。
    ⑥ **增量执行**：先常量与 check-archive，再 detect-mode。
    ⑦ **回归测绿**：`typecheck` + `npm test`；抽样运行生成脚本 `check-archive`。
    ⑧ **用户确认**。
  - **完成定义（DoD）**：无手写平行实现；改 `verify+done` 判定只改一处即可两边一致；测试绿。
  - **SDD 联动**：否（实现后若 skill 命令表变化则改 SKILL 指向，属 B-T04）
  - **跨级别**：完成后可同步将 `design/badsmells.md` DESIGN-RD-001 标为已消除（经用户确认）。

---

### B-T02：拆分 `project-state` 低内聚模块（消除 ARCH-CH-001）

- [x] **B-T02.** 按职责拆分 state IO / 模式探测 / 归档门控
  - **依赖**：B-T01（先统一双轨，避免拆完再复制）。
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `ARCH-CH-001`。
  - **涉及路径**：`src/core/project-state.ts`；新建如 `archive-readiness.ts` / `development-mode.ts`；`init.ts`、测试 import
  - **步骤**：
    ① **确认**：单文件混合 IO、wipe、detect、pipeline、archive。
    ② **影响分析**：列出全部 import 方；决定 facade 是否保留 `project-state.ts` 再导出。
    ③ **测试安全网**：迁移前跑通 `project-state.test.ts`。
    ④ **选择架构模式**：**按职责分包 + 可选 facade**。
    ⑤ **迁移计划**：① 抽 `archive-readiness`；② 抽 detect/wipe（若合适）；③ 更新 import；④ 删除空壳或保留 re-export。
    ⑥ **增量执行**：一次只迁一类职责。
    ⑦ **回归测绿**：全量 `npm test` + typecheck。
    ⑧ **用户确认**。
  - **完成定义（DoD）**：归档门控模块可独立阅读/测试；原公开 API 行为不变。
  - **SDD 联动**：否

---

### B-T03：为 agent 暴露 promote 可执行边界（消除 ARCH-BD-001）

- [x] **B-T03.** 提供与 state 脚本同级的 promote 入口，并改 skill 指向
  - **依赖**：建议在 DESIGN/IMPL 侧完成 promote 模块化（`design` B-T02 / `impl` B-T01）后再做，或本任务内先做最小可运行包装。
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `ARCH-BD-001`。
  - **涉及路径**：新建 `scripts/sparrow-promote.mjs`（或 `sparrow promote` CLI）；`sparrow-archive/SKILL.md`；`schema.yaml` scripts 声明；`spec-promote.ts`
  - **步骤**：
    ① **确认**：skill 要求 promote，但生成态仅有 state 脚本。
    ② **影响分析**：delta 规则必须与 core 一致；部分归档需 `slugAllowlist` 参数。
    ③ **测试安全网**：现有 `spec-promote.test.ts`；新增脚本/CLI 冒烟。
    ④ **选择架构模式**：**防腐层/适配脚本**（mjs 调编译产物）或 **将 promote 逻辑下沉为可被脚本复用的纯 JS 生成物**。
    ⑤ **迁移计划**：① 选定入口形态；② 实现 ADDED/MODIFIED/REMOVED；③ 更新 skill/schema；④ init 复制脚本。
    ⑥ **增量执行**：先 happy-path ADDED，再 MODIFIED/REMOVED/allowlist。
    ⑦ **回归测绿**：`npm test` + 脚本对临时目录 promote。
    ⑧ **用户确认**。
  - **完成定义（DoD）**：用户项目仅凭生成脚本可完成 archive 必做 promote；SKILL 不再指向不可达 TS 符号。
  - **SDD 联动**：是 — `sparrow-archive/SKILL.md`、workflow-block、必要时 README。

---

### B-T04：收敛 archive 规则多点僵化（消除 ARCH-EV-001）

- [ ] **B-T04.** 归档完成判定与命令表单一驱动，减少级联文档修改
  - **依赖**：B-T01、B-T03。
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `ARCH-EV-001`。
  - **涉及路径**：skill / workflow-block / README；可选从 schema 或共享片段生成说明
  - **步骤**：
    ① **确认**：判定语义散落实现与多份文档。
    ② **影响分析**：文档双语与 skill 同步成本。
    ③ **测试安全网**：skill-generation 已有 dest 路径断言；可增「关键短语与实现一致」轻量测。
    ④ **选择架构模式**：**生成文档片段** 或 **单一契约模块 + 文档引用**。
    ⑤ **迁移计划**：列出权威源 → 删重复叙述 → 保留用户可读摘要。
    ⑥ **增量执行**：先 skill/workflow，再 README。
    ⑦ **回归测绿**：生成测 + 人工抽读。
    ⑧ **用户确认**。
  - **完成定义（DoD）**：改完成判定时实现变更点 ≤2；文档无互相矛盾的完成定义。
  - **SDD 联动**：是 — README / SKILL / workflow-block

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-09-20 | `fe8c2cc` | 初版：B-T01~B-T04 对应 ARCH-CP/CH/BD/EV。 |
