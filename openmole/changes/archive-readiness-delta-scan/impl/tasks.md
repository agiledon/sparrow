# 坏味道驱动重构任务（OpenMole Tasks）

**版本**：0.1.0
**状态**：草案
**依据**：[badsmells.md](./badsmells.md)
**修订日期**：2026-09-20

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 任务分解正式规约载体 |
| **关联坏味道** | 见 [badsmells.md](./badsmells.md) |
| **级别** | IMPL |
| **提交版本** | `fe8c2cc` |

---

## 1. 执行约定

- **标准步骤（IMPL 6 步）**：① 确认 / ② 补测 / ③ 测绿 / ④ 应用重构 / ⑤ 回归测绿 / ⑥ **用户确认**。
- **测试安全网**：`npm test` → `src/core/spec-promote.test.ts`。
- **建议**：与 `design/tasks.md` B-T02/B-T04 合并执行时可一次 diff 消多项，但仍须按 mole-apply **一次确认一个 BS-ID**（或经用户批准捆绑）。

---

## 2. 任务 backlog

### B-T01：缩短并拆分 `promoteChangeToMaster`（消除 IMPL-GEN-001）

- [x] **B-T01.** 将长函数拆为命名步骤，主流程可读
  - **依赖**：优先跟随 `design` B-T02；若 DESIGN 未做，本任务仅做函数内抽取。
  - **级别**：IMPL
  - **坏味道**：`badsmells.md` §2 / `IMPL-GEN-001`。
  - **涉及路径**：`src/core/spec-promote.ts`
  - **步骤**：① 确认行数与分支 → ② 补测（若缺口）→ ③ 测绿 → ④ Extract Function → ⑤ 回归 → ⑥ 确认。
  - **完成定义（DoD）**：编排函数显著变短；行为不变；测试绿。
  - **SDD 联动**：否

---

### B-T02：分离纯 delta 计算与 fs 副作用（消除 IMPL-FP-001）

- [x] **B-T02.** 抽取纯函数计算 deltas，写盘独立
  - **依赖**：B-T01 或 `design` B-T02。
  - **级别**：IMPL
  - **坏味道**：`badsmells.md` §2 / `IMPL-FP-001`。
  - **涉及路径**：`src/core/spec-promote.ts`；测试可增加无磁盘比较用例
  - **步骤**：① 确认混杂 → ② 为纯函数补测 → ③ 测绿 → ④ 抽取 → ⑤ 回归 → ⑥ 确认。
  - **完成定义（DoD）**：存在可单测的纯比较 API；写盘函数单独调用。
  - **SDD 联动**：否

---

### B-T03：澄清 promote 参数命名（消除 IMPL-GEN-002）

- [ ] **B-T03.** 重命名/统一 `sourceOrOptions` 为清晰 Options
  - **依赖**：`design` B-T04（推荐同一变更集）。
  - **级别**：IMPL
  - **坏味道**：`badsmells.md` §2 / `IMPL-GEN-002`。
  - **涉及路径**：`spec-promote.ts`；测试调用
  - **步骤**：① 确认含糊名 → ② 测网 → ③ 测绿 → ④ Rename / API 统一 → ⑤ 回归 → ⑥ 确认。
  - **完成定义（DoD）**：调用处参数名可读；无双形态歧义。
  - **SDD 联动**：否

---

### B-T04：命名历史分桶谓词（消除 IMPL-GEN-003）

- [x] **B-T04.** 抽出 `isRequirementHistoryDelta` / `isDesignHistoryDelta`
  - **依赖**：B-T01（同文件整理时一并做更合适）。
  - **级别**：IMPL
  - **坏味道**：`badsmells.md` §2 / `IMPL-GEN-003`。
  - **涉及路径**：`src/core/spec-promote.ts` L259–271 一带
  - **步骤**：① 确认难读过滤 → ② 可选单测谓词 → ③ 测绿 → ④ Extract → ⑤ 回归（历史文件断言）→ ⑥ 确认。
  - **完成定义（DoD）**：分桶逻辑有命名函数；requirement/design 历史内容不变。
  - **SDD 联动**：否

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-09-20 | `fe8c2cc` | 初版：B-T01~B-T04 对应 IMPL-GEN/FP。 |
