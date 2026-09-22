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
| **A** — badsmells §2.0 | IMPL-GEN-008, IMPL-GEN-009, IMPL-GEN-010, IMPL-GEN-011（4，全部 **未清除**） |
| **B** — tasks 引用 | B-T01→008, B-T02→009, B-T03→011, B-T04→010（4，**1:1**） |
| **C** — 新增 | 无 |
| **D** — 孤儿 | 无 |
| **E** — DoD | IMPL-GEN-009 DoD 与 DESIGN-RD-002 / ARCH-LY-002 消除标准第 3 项一致（read-plan 同步在 design/arch 任务验收） |
| **F** — 结论 | **通过** |

**依赖图（本级）**：B-T03 → B-T02；B-T04 → arch B-T04 / design B-T03；B-T01 独立；无环。

---

## 3. 三角检查清单

| 检查项 | 结果 |
|--------|------|
| badsmells ↔ 任务 | 通过：每 BS 一任务，级别均为 IMPL |
| 任务 ↔ 宪法 | IMPL 6 步；B-T04 标明 SDD 联动 |
| 跨级别 | projectRoot 相关 BS 分布在 ARCH/DESIGN/IMPL，tasks 依赖链一致；ensure 相关 GEN-010 与 arch CP-002 分工明确（实现 vs 架构边界） |

---

## 4. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-09-22 | `461c270237ee49b2bc28bb4e9aa13986b88a911e` | mole-verify 初验：1:1 覆盖，通过。 |
