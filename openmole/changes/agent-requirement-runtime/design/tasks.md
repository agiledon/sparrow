# 坏味道驱动重构任务（OpenMole Tasks）

**版本**：0.1.0
**状态**：草案
**依据**：[badsmells.md](./badsmells.md)
**修订日期**：2026-09-22

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 任务分解正式规约载体 |
| **关联坏味道** | 见 [badsmells.md](./badsmells.md) |
| **级别** | DESIGN |
| **提交版本** | `461c270237ee49b2bc28bb4e9aa13986b88a911e` |

---

## 1. 执行约定

- **标准步骤（DESIGN 7 步）**：① 确认 / ② 识别接缝 / ③ 测试安全网 / ④ 解依赖 / ⑤ 应用重构 / ⑥ 回归测绿 / ⑦ **用户确认**。
- **测试安全网**：`npm test`（`read-plan` / ingest / skill-generation）+ `typecheck`。
- **建议顺序**：B-T01 → B-T02；B-T03 对齐 `arch` B-T04；B-T04 在 ingest 契约稳定后（B-T01 后）。

---

## 2. 任务 backlog

### B-T01：read-plan 自描述 projectRoot（消除 DESIGN-RD-002）

- [ ] **B-T01.** read-plan JSON 含 root 或 command 含 `--project-root`，与 SKILL cwd 纪律解耦
  - **依赖**：`impl/tasks.md` B-T02、B-T03。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `DESIGN-RD-002`。
  - **涉及路径**：`src/core/ingest/read-plan.ts`；`run.ts` 写 plan；ingest 测试 snapshot；harness `requirements.md` §ingest
  - **步骤**：
    ① **确认**：command 仅含 show + 源路径，无 root。
    ② **识别接缝**：`buildReadPlan` vs `showCommand` vs plan schema。
    ③ **测试安全网**：锁定 command 生成单测。
    ④ **解依赖**：agent 先读 plan 再 exec，不依赖隐含 cwd。
    ⑤ **应用重构**：加字段或 flag；旧 cache 兼容策略（optional 字段）。
    ⑥ **回归测绿**。
    ⑦ **用户确认**。
  - **完成定义（DoD）**：满足 DESIGN-RD-002 消除标准；harness 一句更新。
  - **SDD 联动**：是 — harness requirement ingest 小节。
  - **跨级别**：与 `arch` B-T01 同源验收。

---

### B-T02：ingest 纪律单源同步（消除 DESIGN-DF-002）

- [ ] **B-T02.** 单源 Markdown 或 schema 驱动 SKILL + workflow-block + harness ingest 段
  - **依赖**：`arch/tasks.md` B-T02（schema 元数据）推荐先做或同批。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `DESIGN-DF-002`。
  - **涉及路径**：共享片段（如 `harness/requirement/ingest-cli.md` 或 schema 字段）；`SKILL.md`；`workflow-blocks/sparrow-requirement.md`；`requirements.md`；sync-schema / CI 断言
  - **步骤**：
    ① **确认**：三处同构 prose，改一处易漏。
    ② **识别接缝**：生成边界（bundled-content / sync-schema）。
    ③ **测试安全网**：skill-generation 关键短语断言或 snapshot。
    ④ **解依赖**：删除重复段落，改为 include/生成。
    ⑤ **应用重构**：落地单源 + sync。
    ⑥ **回归测绿**：`npm run sync-schema` + 测。
    ⑦ **用户确认**。
  - **完成定义（DoD）**：ingest MUST/MUST NOT 变更只改单源；三处一致 CI 可证。
  - **SDD 联动**：是 — schema / SKILL / harness / workflow-block。

---

### B-T03：ensure-create 经 set-step 写 pipeline（消除 DESIGN-EN-002）

- [ ] **B-T03.** create 变更工作区后 pipeline 与 sparrow-state 封装一致
  - **依赖**：`arch/tasks.md` B-T04。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `DESIGN-EN-002`。
  - **涉及路径**：`ensure-change-workspace.mjs`；`sparrow-state.mjs`；`SKILL.md` L38–39
  - **步骤**：
    ① **确认**：`writeChangeId` 越权，set-step 可跳过。
    ② **识别接缝**：ensure 仅文件系统；state 仅 JSON 语义。
    ③ **测试安全网**：脚本集成测 create → pipeline requirement ongoing。
    ④ **解依赖**：ensure 不再直接 writeFileSync state 业务字段（或只 delegate）。
    ⑤ **应用重构**：合并为单一用户可见步骤或自动 spawn set-step。
    ⑥ **回归测绿**。
    ⑦ **用户确认**。
  - **完成定义（DoD）**：满足 DESIGN-EN-002 消除标准；`--check` 可发现不一致。
  - **SDD 联动**：是 — SKILL 步骤 5 简化。
  - **跨级别**：与 `impl` B-T04 同 diff 可接受，mole-apply 仍逐 BS 确认。

---

### B-T04：拆分 runIngest 编排（消除 DESIGN-MO-002）

- [ ] **B-T04.** 将 cache hit/miss、figures、read-plan 编排拆为命名阶段函数
  - **依赖**：`design` B-T01 完成后再动 read-plan 相关段（推荐）。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `DESIGN-MO-002`。
  - **涉及路径**：`src/core/ingest/run.ts`；现有 ingest 子模块测试
  - **步骤**：
    ① **确认**：单函数串联 parse/cache/plan/progress。
    ② **识别接缝**：已有 `readers`/`cache`/`read-plan` 模块边界。
    ③ **测试安全网**：ingest 全量测试绿后再抽。
    ④ **解依赖**：progress stderr 格式不变。
    ⑤ **应用重构**：Extract Function / 阶段类型；`runIngest` 薄编排。
    ⑥ **回归测绿**。
    ⑦ **用户确认**。
  - **完成定义（DoD）**：变更 projectRoot 契约时主要改阶段函数而非单块 200 行流程。
  - **SDD 联动**：否

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-09-22 | `461c270237ee49b2bc28bb4e9aa13986b88a911e` | 初版：B-T01~B-T04 对应 DESIGN-RD/DF/EN/MO。 |
