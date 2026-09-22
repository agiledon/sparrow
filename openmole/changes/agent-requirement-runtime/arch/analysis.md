# 坏味道驱动重构分析（OpenMole Analysis）

**版本**：0.1.0
**状态**：草案
**依据**：[badsmells.md](./badsmells.md)、[tasks.md](./tasks.md)
**修订日期**：2026-09-22

---

## 1. 目的

在重构编码前校验文档链：badsmells ↔ tasks 覆盖、依赖无环、DoD 可验收。**先改文档，再改代码。**

---

## 2. `badsmells.md` 变更后的强制差分（核心）

| 步骤 | 动作 |
|------|------|
| A | 列出 badsmells 全部 BS-ID |
| B | 列出 tasks 引用的 BS-ID |
| C | 新增 → 增补任务 |
| D | 删除/合并 → 处理孤儿 |
| E | 验收变更 → 同步 DoD |
| F | 摘要写入 §2.1 |

### 2.1 最近一次差分记录

**差分日期**：2026-09-22  
**badsmells.md 版本**：0.1.0  
**tasks.md 版本**：0.1.0  
**提交版本**：`461c270237ee49b2bc28bb4e9aa13986b88a911e`

| 步骤 | 结果 |
|------|------|
| **A** — badsmells §2.0 | ARCH-BD-002, ARCH-LY-002, ARCH-BD-003, ARCH-CP-002（4，全部 **未清除**） |
| **B** — tasks 引用 | B-T01→LY-002, B-T02→BD-003, B-T03→BD-002, B-T04→CP-002（4，**1:1**） |
| **C** — 新增 | 无 |
| **D** — 孤儿 | 无 |
| **E** — DoD | 各任务 DoD 引用对应 badsmells **消除标准**；无需改 tasks |
| **F** — 结论 | **通过**。可进入 `mole-apply`（建议先 `impl` B-T02 或 `impl` B-T01） |

**依赖图（本级）**：B-T01 依赖 impl B-T02 + design B-T01；B-T04 与 design B-T03 / impl B-T04 协调；B-T02 ∥ B-T03 可并行；无环。

---

## 3. 三角检查清单

| 检查项 | 结果 |
|--------|------|
| badsmells ↔ 任务 | 通过：每 BS 一任务，级别均为 ARCH |
| 任务 ↔ 宪法 | ARCH 8 步 + DoD 含测绿与用户确认；B-T01/B-T02/B-T04 标明 SDD 联动 |
| 跨级别 | ARCH-LY-002 与 `design` RD-002、`impl` GEN-009/011 为同一契约分层，非错归类；ARCH-CP-002 与 `design` EN-002、`impl` GEN-010 为同一 refactor  seam，tasks 已交叉引用 |

---

## 4. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-09-22 | `461c270237ee49b2bc28bb4e9aa13986b88a911e` | mole-verify 初验：1:1 覆盖，通过。 |
