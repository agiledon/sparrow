# 坏味道驱动重构任务（OpenMole Tasks）

**版本**：0.1.0
**状态**：草案
**依据**：[badsmells.md](./badsmells.md)
**修订日期**：2026-09-20

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 任务分解正式规约载体 |
| **关联坏味道** | 见 [badsmells.md](./badsmells.md) |
| **级别** | DESIGN |
| **提交版本** | `fe8c2cc` |

---

## 1. 执行约定

- **标准步骤（DESIGN 7 步）**：① 确认 / ② 识别接缝 / ③ 测试安全网 / ④ 解依赖 / ⑤ 应用重构 / ⑥ 回归测绿 / ⑦ **用户确认**。
- **测试安全网**：`npm test`（尤其 `spec-promote.test.ts`、`project-state.test.ts`）+ `typecheck`。
- **跨级别**：B-T01 与 ARCH B-T01 同源；若 ARCH 先完成，本项可经验证直接关闭。

---

## 2. 任务 backlog

### B-T01：消除 state 双轨 Duplicate Code（消除 DESIGN-RD-001）

- [x] **B-T01.** 删除 `sparrow-state.mjs` 与 `project-state.ts` 平行实现
  - **依赖**：无（或对齐 `arch/tasks.md` B-T01；二者择一主导，另一验证关闭）。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `DESIGN-RD-001`。
  - **涉及路径**：同 ARCH-CP-001
  - **步骤**：
    ① **确认**：列出重复符号表。
    ② **识别接缝**：生成边界（sync 脚本）或运行时边界（CLI）。
    ③ **测试安全网**：锁定 check-archive / detect-mode 行为。
    ④ **解依赖**：mjs 不再手写业务，改为生成或委托。
    ⑤ **应用重构**：落地单一源。
    ⑥ **回归测绿**。
    ⑦ **用户确认**。
  - **完成定义（DoD）**：无平行业务实现；RD-01 验收与 ARCH-CP-001 一致。
  - **SDD 联动**：否

---

### B-T02：模块化 promote（消除 DESIGN-MO-001）

- [x] **B-T02.** 拆分 `computeDeltas` / `applyDeltas` / `appendHistories`
  - **依赖**：无。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `DESIGN-MO-001`。
  - **涉及路径**：`src/core/spec-promote.ts`；`src/core/spec-promote.test.ts`
  - **步骤**：
    ① **确认**：单函数串比较+写盘+历史。
    ② **识别接缝**：纯数据 `Map<path,string>` → deltas；写盘边界。
    ③ **测试安全网**：现有四类 promote 测。
    ④ **解依赖**：历史模板渲染不依赖写盘顺序之外的隐式状态。
    ⑤ **应用重构**：抽出纯函数与应用函数；保持 `promoteChangeToMaster` 薄编排。
    ⑥ **回归测绿**。
    ⑦ **用户确认**。
  - **完成定义（DoD）**：纯比较可单测；对外 `PromoteResult` 兼容；ADDED/MODIFIED/REMOVED/allowlist 行为不变。
  - **SDD 联动**：否
  - **跨级别**：完成后利于 IMPL-GEN-001 / IMPL-FP-001 关闭。

---

### B-T03：聚合归档语义，缓解 Shotgun Surgery（消除 DESIGN-DF-001）

- [ ] **B-T03.** 将完成判定/部分归档/delta 语义收拢到可引用契约
  - **依赖**：B-T01；建议在 ARCH B-T04 前完成契约，供文档引用。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `DESIGN-DF-001`。
  - **涉及路径**：core 契约模块；skill/README 改为引用摘要
  - **步骤**：① 确认多处同质描述 → ② 接缝（共享常量/短模块）→ ③ 测网 → ④ 解文档与实现双写 → ⑤ 聚合 → ⑥ 回归 → ⑦ 确认。
  - **完成定义（DoD）**：语义变更时实现点集中；无互相矛盾的完成定义副本。
  - **SDD 联动**：是 — skill / README 引用方式

---

### B-T04：统一 promote Options API（消除 DESIGN-EN-001）

- [x] **B-T04.** 废弃 `sourceOrOptions` 双形态，统一 `PromoteOptions`
  - **依赖**：B-T02（模块化时一并改签名更干净）。
  - **级别**：DESIGN
  - **坏味道**：`badsmells.md` §2 / `DESIGN-EN-001`。
  - **涉及路径**：`spec-promote.ts`；所有调用方/测试
  - **步骤**：① 确认双形态 → ② 接缝（测试调用）→ ③ 测网 → ④ 解旧签名 → ⑤ 统一 Options → ⑥ 回归 → ⑦ 确认。
  - **完成定义（DoD）**：仅一种公开调用形态；typecheck 通过；测试更新完毕。
  - **SDD 联动**：否
  - **跨级别**：同步关闭 IMPL-GEN-002。

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-09-20 | `fe8c2cc` | 初版：B-T01~B-T04 对应 DESIGN-RD/MO/DF/EN。 |
