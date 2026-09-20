# 坏味道规约文档（OpenMole Bad Smells）

**版本**：0.2.0
**状态**：草案
**依据**：OpenMole 规约摘要（见 Skill 内嵌）；change 内 [tasks.md](./tasks.md)
**修订日期**：2026-09-20

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 坏味道环节正式规约载体 |
| **统计范围** | `src/`（TypeScript）+ `sparrow-state.mjs` 模板 |
| **关联任务** | 见 [tasks.md](./tasks.md)（待 `mole-plan`） |

---

## 1. 说明

- 条目格式见 Skill 内嵌 specification §4。
- 本 change 的 **DESIGN** 级别扫描，范围：封装、模块化、冗余、设计缺陷。

> **跨 change 去重**：`archive/2026-08-13-initial-scan` 中 DESIGN-RD-001~003、DESIGN-BS-001、DESIGN-DF-001 均为 **已消除**；本轮不重复开单。

> **扫描结论**：state 双轨复制构成明确 Duplicate Code；`promoteChangeToMaster` 兼具比较/写盘/历史分桶，模块化不足；归档相关变更呈 Shotgun Surgery。

---

## 2. 坏味道条目

### 2.0 索引与消除状态

| BS-ID | 类别 | 状态 | 说明 |
|-------|------|------|------|
| DESIGN-RD-001 | 冗余 | 已消除 | `project-state.ts` ↔ `sparrow-state.mjs` 重复实现（RD-01） |
| DESIGN-MO-001 | 模块化 | 未清除 | `promoteChangeToMaster` 职责过重（MO-01） |
| DESIGN-DF-001 | 设计缺陷 | 未清除 | 归档语义变更需改多处（DF-02 Shotgun Surgery） |
| DESIGN-EN-001 | 封装 | 未清除 | promote 重载 API（string \| Options）泄漏演进细节（EN-04） |

---

### DESIGN-RD-001 — state / archive 逻辑重复实现

| 字段 | 内容 |
|------|------|
| **级别** | DESIGN |
| **位置** | `src/core/project-state.ts` L52–63、L121–154、L247–290、L380–439；`src/schemas/templates/shared/scripts/sparrow-state.mjs` L24–37、L47–72、L103–200 |
| **描述** | `MODES`/`STEPS`/`STATUSES`、`IGNORE_DIRS`/`SOURCE_EXT`、normalize、hasSourceFiles、detectMode、checkArchive/isSlugReady 在 TS 与 mjs 近乎平行实现。修复或扩展归档门控时必须复制粘贴，违反 DRY，并与 ARCH-CP-001 同源。（Fowler: Duplicate Code） |
| **对齐原则** | 宪法 §3 — 复用性、一致性 |
| **消除标准（验收）** | 1) 删除一轨手写副本（生成或共享模块）；2) 行为以 `project-state.test.ts` / 脚本契约测为单一验收；3) 无并行常量表。 |
| **风险与约束** | 生成脚本须保持零打包依赖；可接受「TS 为源、构建吐出 mjs」。 |

---

### DESIGN-MO-001 — `promoteChangeToMaster` 不足模块化

| 字段 | 内容 |
|------|------|
| **级别** | DESIGN |
| **位置** | `src/core/spec-promote.ts` `promoteChangeToMaster`（约 L183–298，~115 行） |
| **描述** | 单函数串联：解析 source/options、收集相对路径、ADDED/MODIFIED 写盘、REMOVED 对称差、requirement/design 历史分桶与模板渲染。delta 策略与 IO/历史策略缠在一起，难以单独单测「仅比较」或「仅写历史」。（PHAME: Insufficient Modularization） |
| **对齐原则** | 宪法 §3 — 清晰性、可扩展性 |
| **消除标准（验收）** | 1) 抽出纯函数 `computeDeltas`（或等价）与 `applyDeltas`/`appendHistories`；2) 比较逻辑无 fs；3) 现有 promote 测试仍覆盖端到端，并可为纯比较补测。 |
| **风险与约束** | 公共签名 `PromoteResult` 尽量保持；内部重构优先。 |

---

### DESIGN-DF-001 — 归档语义 Shotgun Surgery

| 字段 | 内容 |
|------|------|
| **级别** | DESIGN |
| **位置** | `project-state.ts`、`sparrow-state.mjs`、`sparrow-archive/SKILL.md`、`workflow-blocks/sparrow-archive.md`、`README.md` / `README.zh-CN.md`、`revision-history-entry.md` |
| **描述** | 「完整/部分归档」「slugAllowlist」「revision-history 按 slug 分组」等概念散落在实现与多份文档。一次语义微调引发多文件同质修改，缺少聚合抽象。（Fowler: Shotgun Surgery） |
| **对齐原则** | 宪法 §3 — 一致性、简洁性 |
| **消除标准（验收）** | 1) 关键契约集中在一处（模块 + 可生成摘要）；2) 文档从该处引用或生成，减少手写重复；3) 改判定条件时实现变更点 ≤2。 |
| **风险与约束** | 与 ARCH-EV-001 同根；DESIGN 侧侧重抽象聚合，ARCH 侧侧重演进僵化。 |

---

### DESIGN-EN-001 — promote 重载参数泄漏

| 字段 | 内容 |
|------|------|
| **级别** | DESIGN |
| **位置** | `src/core/spec-promote.ts` L183–193（`sourceOrOptions: 'current' \| 'archive' \| PromoteOptions` + 可选 `archiveFolderName`） |
| **描述** | 为兼容旧调用保留位置参数与 Options 对象双形态，调用方与测试需理解两种分支。演进细节（allowlist）塞进 Options 后，旧签名仍暴露，封装不足。（PHAME: Deficient Encapsulation） |
| **对齐原则** | 宪法 §3 — 清晰性 |
| **消除标准（验收）** | 1) 统一为 `PromoteOptions`（或弃用位置重载并标 deprecated）；2) 测试与内部调用只走一种形态；3) typecheck 无双路径歧义。 |
| **风险与约束** | 若包对外导出该 API，需考虑 minor 兼容；当前主要测试内使用，迁移成本低。 |

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-09-20 | `fe8c2cc` | 初版：DESIGN-RD-001、DESIGN-MO-001、DESIGN-DF-001、DESIGN-EN-001。 |
| 0.2.0 | 2026-09-20 | — | 随 arch B-T01：mjs 生成自 core；DESIGN-RD-001 → 已消除。 |
