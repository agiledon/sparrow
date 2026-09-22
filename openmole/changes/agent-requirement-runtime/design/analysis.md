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

### 2.1 最近一次差分记录

**差分日期**：2026-09-22  
**badsmells.md 版本**：0.1.0  
**tasks.md 版本**：0.1.0  
**提交版本**：`461c270237ee49b2bc28bb4e9aa13986b88a911e`

| 步骤 | 结果 |
|------|------|
| **A** — badsmells §2.0 | DESIGN-RD-002, DESIGN-DF-002, DESIGN-EN-002, DESIGN-MO-002（4，全部 **未清除**） |
| **B** — tasks 引用 | B-T01→RD-002, B-T02→DF-002, B-T03→EN-002, B-T04→MO-002（4，**1:1**） |
| **C** — 新增 | 无 |
| **D** — 孤儿 | 无 |
| **E** — DoD | 与 badsmells 消除标准对齐；B-T01/B-T02/B-T03 DoD 显式引用对应 BS 验收项 |
| **F** — 结论 | **通过** |

**依赖图（本级）**：B-T01 → impl B-T02/B-T03；B-T02 → arch B-T02；B-T03 → arch B-T04；B-T04 → B-T01（推荐）；无环。

---

## 3. 三角检查清单

| 检查项 | 结果 |
|--------|------|
| badsmells ↔ 任务 | 通过：每 BS 一任务，级别均为 DESIGN |
| 任务 ↔ 宪法 | DESIGN 7 步；SDD 联动在 B-T01/B-T02/B-T03 已标注 |
| 跨级别 | DESIGN-DF-002 与 arch BD-003 协调；DESIGN-EN-002 与 arch CP-002 / impl GEN-010 同源，非重复开单 |

---

## 4. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-09-22 | `461c270237ee49b2bc28bb4e9aa13986b88a911e` | mole-verify 初验：1:1 覆盖，通过。 |
