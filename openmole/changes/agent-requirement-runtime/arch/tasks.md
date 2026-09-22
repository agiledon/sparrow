# 坏味道驱动重构任务（OpenMole Tasks）

**版本**：0.1.0
**状态**：草案
**依据**：[badsmells.md](./badsmells.md)
**修订日期**：2026-09-22

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 任务分解正式规约载体 |
| **统计范围** | init/schema、ingest CLI 边界、requirement 生成态 scripts |
| **关联坏味道** | 见 [badsmells.md](./badsmells.md) |
| **级别** | ARCH |
| **提交版本** | `461c270237ee49b2bc28bb4e9aa13986b88a911e` |

---

## 1. 执行约定

- **任务来源**：必须根据 [`badsmells.md`](./badsmells.md) §2.0 **未清除** 条目规划。
- **标准步骤（ARCH 8 步）**：① 确认坏味道 / ② 影响分析 / ③ 测试安全网 / ④ 选择架构模式 / ⑤ 迁移计划 / ⑥ 增量执行 / ⑦ 回归测绿 / ⑧ **用户确认**。
- **测试安全网**：`npm run typecheck` + `npm test`（含 ingest / skill-generation / init 相关测）。
- **跨级别建议顺序**：`impl` B-T02（CLI `--project-root`）→ 本目录 B-T01 验收 → B-T02 → B-T03 → B-T04（与 `design` B-T03、`impl` B-T04 可同批确认）。

---

## 2. 任务 backlog

### B-T01：ingest 显式 projectRoot 架构面（消除 ARCH-LY-002）

- [x] **B-T01.** CLI 与 read-plan 以 `--project-root` 绑定 `.sparrow/ingest/`，不再仅靠 agent cwd 纪律
  - **依赖**：`impl/tasks.md` B-T02（CLI 接线）；`design/tasks.md` B-T01（read-plan 字段/command）。
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `ARCH-LY-002`。
  - **涉及路径**：`src/cli/index.ts`；`src/core/ingest/run.ts`；`src/core/ingest/read-plan.ts`；ingest 测试；`sparrow-requirement/SKILL.md` / harness（说明 plan 内 root）
  - **步骤**：
    ① **确认**：缓存 hash 与 `projectRoot` 绑定，CLI 未暴露参数。
    ② **影响分析**：monorepo、IDE 任务 cwd；已生成 read-plan.json 兼容策略。
    ③ **测试安全网**：现有 ingest 单测；补「cwd≠root + flag 命中同一 cache」用例。
    ④ **选择架构模式**：**CLI 参数面承载项目根** + read-plan 自描述（非 SKILL 重复 prose）。
    ⑤ **迁移计划**：默认 cwd 不变；新 flag 可选；文档/agent 纪律改为「读 plan 或 flag」。
    ⑥ **增量执行**：先 CLI + core，再 read-plan command，再 harness 一句摘要。
    ⑦ **回归测绿**：`typecheck` + ingest 测试全绿。
    ⑧ **用户确认**。
  - **完成定义（DoD）**：满足 badsmells ARCH-LY-002 消除标准三项。
  - **SDD 联动**：是 — harness / SKILL 仅最小 delta（指向 plan root，不恢复 scripts 包装）。
  - **跨级别**：关闭 `impl` B-T02、`design` B-T01 对应 BS（经验证后标已消除）。

---

### B-T02：schema 声明 requirement 前置 CLI（消除 ARCH-BD-003）

- [ ] **B-T02.** 在 schema 或生成管线中暴露 `ingest` 为包 CLI 能力，非 skill scripts
  - **依赖**：无（可与 B-T03 并行）。
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `ARCH-BD-003`。
  - **涉及路径**：`src/schemas/schema.yaml`（如 `cliCommands` / step 元数据）；`workflow-blocks/sparrow-requirement.md`；init 生成 Cursor command 若有；`npm run sync-schema` + 生成测
  - **步骤**：
    ① **确认**：schema `scripts:` 仅有 state/ensure，agent 易扫 scripts 误判。
    ② **影响分析**：init/update 生成物；禁止 mammoth 进用户 scripts。
    ③ **测试安全网**：skill-generation / schema 断言扩展。
    ④ **选择架构模式**：**schema 元数据 + workflow-block 生成**，ingest 仍单入口在 `sparrow` CLI。
    ⑤ **迁移计划**：字段设计 → sync-schema → 更新 workflow-block 生成或模板。
    ⑥ **增量执行**：schema 先，再 workflow，再 README 一句（可选）。
    ⑦ **回归测绿**：`sync-schema` + 相关单测。
    ⑧ **用户确认**。
  - **完成定义（DoD）**：init 后 agent 可见面明确「ingest = CLI」；无 skill ingest 包装。
  - **SDD 联动**：是 — schema、workflow-block；配合 `design` B-T02。

---

### B-T03：init/update 暴露 CLI 就绪边界（消除 ARCH-BD-002）

- [ ] **B-T03.** init/update 输出或写入 `.sparrow/` 就绪信息，含 sparrow CLI 探测
  - **依赖**：无。
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `ARCH-BD-002`。
  - **涉及路径**：`src/core/init.ts`；`src/cli/index.ts` init/update action；可选 `.sparrow/cli-readiness.json`；README 解析顺序（bin / npx / global）
  - **步骤**：
    ① **确认**：requirement 步骤 4 才 `--version`，init 无提示。
    ② **影响分析**：不静默 npm install；离线友好文案。
    ③ **测试安全网**：init 测或 smoke；mock PATH 无 sparrow。
    ④ **选择架构模式**：**非阻塞探测 + 明确 stderr/JSON 记录**（失败不阻断 init，但 agent 可读）。
    ⑤ **迁移计划**：探测函数 → init/update 调用 → 文档对齐 SKILL 步骤 4。
    ⑥ **增量执行**：core 探测 → CLI 输出 → 文档。
    ⑦ **回归测绿**：init 测试 + typecheck。
    ⑧ **用户确认**。
  - **完成定义（DoD）**：满足 ARCH-BD-002 消除标准；无自动装包。
  - **SDD 联动**：可选 README / harness 一句引用就绪文件。

---

### B-T04：ensure-change 委托 state 脚本（消除 ARCH-CP-002）

- [x] **B-T04.** 删除 ensure 内第三次 state 片段复制，统一 active-change / pipeline 写入
  - **依赖**：建议在 `design` B-T03、`impl` B-T04 同主题任务一起规划 diff。
  - **级别**：ARCH
  - **坏味道**：`badsmells.md` §2 / `ARCH-CP-002`。
  - **涉及路径**：`ensure-change-workspace.mjs`；`sparrow-state.mjs`（新子命令如 `set-active-change` / 组合 create）；`SKILL.md` 步骤 5；`schema.yaml` scripts
  - **步骤**：
    ① **确认**：ensure 与 state 双写 active-change，pipeline 与 set-step 分叉。
    ② **影响分析**：用户已安装旧 ensure；需 `sparrow update`。
    ③ **测试安全网**：state 脚本行为测或集成脚本测（临时目录）。
    ④ **选择架构模式**：**薄 ensure 只建目录 + 调用 state 脚本**。
    ⑤ **迁移计划**：API 设计 → 实现 mjs → 删 duplicate load/write → SKILL 一步化。
    ⑥ **增量执行**：state 子命令 → ensure 委托 → 删内联 JSON。
    ⑦ **回归测绿**：脚本冒烟 + requirement skill 路径抽测。
    ⑧ **用户确认**。
  - **完成定义（DoD）**：create 后 pipeline 与 set-step 一致；无第三份 normalize。
  - **SDD 联动**：是 — SKILL、ensure 模板、sync-schema。
  - **跨级别**：关闭 `design` DESIGN-EN-002、`impl` IMPL-GEN-010。

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-09-22 | `461c270237ee49b2bc28bb4e9aa13986b88a911e` | 初版：B-T01~B-T04 对应 ARCH-LY/BD/BD/CP。 |
