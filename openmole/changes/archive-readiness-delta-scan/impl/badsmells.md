# 坏味道规约文档（OpenMole Bad Smells）

**版本**：0.3.0
**状态**：草案
**依据**：OpenMole 规约摘要（见 Skill 内嵌）；change 内 [tasks.md](./tasks.md)
**修订日期**：2026-09-20

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 坏味道环节正式规约载体 |
| **统计范围** | `src/`（TypeScript；激活 IMPL-COMMON + IMPL-LANG/TypeScript） |
| **关联任务** | 见 [tasks.md](./tasks.md)（待 `mole-plan`） |

---

## 1. 说明

- 条目格式见 Skill 内嵌 specification §4。
- 本 change 的 **IMPL** 级别扫描，范围：函数、命名、参数、语言惯用法。

> **跨 change 去重**：`archive/2026-08-13-initial-scan` 中 IMPL-TS-001、IMPL-GEN-001~003 均为 **已消除**；本轮不重复开单。未再发现 `any` 逃逸（TS-01）广泛复现。

> **扫描结论**：`promoteChangeToMaster` 过长且副作用未分离；历史分桶过滤条件冗长难读；重载参数命名含糊。

---

## 2. 坏味道条目

### 2.0 索引与消除状态

| BS-ID | 类别 | 状态 | 说明 |
|-------|------|------|------|
| IMPL-GEN-001 | 函数 | 已消除 | `promoteChangeToMaster` 过长（IMPL-02） |
| IMPL-FP-001 | 函数式惯用法 | 已消除 | delta 计算与 fs 写盘混在同一函数（FP-01） |
| IMPL-GEN-002 | 命名 | 已消除 | `sourceOrOptions` 语义含糊（IMPL-01） |
| IMPL-GEN-003 | 可读性 | 已消除 | requirement 历史分桶条件嵌套难读（IMPL-04/清晰性） |

---

### IMPL-GEN-001 — `promoteChangeToMaster` 过长

| 字段 | 内容 |
|------|------|
| **级别** | IMPL |
| **位置** | `src/core/spec-promote.ts` L183–298（约 115 行） |
| **描述** | 单函数完成路径解析、文件遍历比较、三类 delta 落盘/记账、双历史文件追加。阅读与局部修改成本高，分支（ADDED/MODIFIED/REMOVED + 历史过滤）交织。（Fowler: Long Function） |
| **对齐原则** | 宪法 §3 — 可读性、简洁性 |
| **消除标准（验收）** | 1) 主流程函数 ≤ ~40 行或清晰分步命名私有函数；2) 行为由现有测试锁定；3) 无行为回归。 |
| **风险与约束** | 与 DESIGN-MO-001 同文件，可一次重构同时消项（需用户确认范围）。 |

---

### IMPL-FP-001 — 纯比较与副作用未分离

| 字段 | 内容 |
|------|------|
| **级别** | IMPL |
| **位置** | `src/core/spec-promote.ts` L217–252（读源/写 master）、L273–290（写 history）同处 `promoteChangeToMaster` |
| **描述** | 判定 ADDED/MODIFIED/REMOVED 的逻辑与 `writeFileSync`/`mkdirSync` 交错，无法在不触碰磁盘的情况下复用或断言 delta 集合。（IMPL-LANG FP-01） |
| **对齐原则** | 宪法 §3 — 清晰性、可扩展性 |
| **消除标准（验收）** | 1) 纯函数输入文件映射 → `PromoteDelta[]`；2) 另函数执行写操作；3) 纯函数单测不创建临时目录亦可运行（可选加强）。 |
| **风险与约束** | 与 IMPL-GEN-001 / DESIGN-MO-001 联动；优先抽取纯函数再压缩主流程。 |

---

### IMPL-GEN-002 — `sourceOrOptions` 命名含糊

| 字段 | 内容 |
|------|------|
| **级别** | IMPL |
| **位置** | `src/core/spec-promote.ts` L187、L190–193 |
| **描述** | 参数名 `sourceOrOptions` 未表达是「源位置」还是「完整选项包」，阅读调用处需回头看类型联合才能理解。（Fowler: Mysterious Name） |
| **对齐原则** | 宪法 §3 — 清晰性 |
| **消除标准（验收）** | 1) 统一 Options 对象后参数名为 `options`；或拆成明确的 `source` + `options`；2) 测试调用可读。 |
| **风险与约束** | 与 DESIGN-EN-001 一并处理更干净。 |

---

### IMPL-GEN-003 — 历史分桶过滤难读

| 字段 | 内容 |
|------|------|
| **级别** | IMPL |
| **位置** | `src/core/spec-promote.ts` L259–271（`requirementHistoryDeltas` / `designHistoryDeltas` 过滤器） |
| **描述** | requirement 分桶用多层 `startsWith` 与 `slug === 'shared'` 否定条件表达「非 architecture/design 的 shared」，缺少命名谓词，读者需心算集合运算；易在追加路径类型时引入静默错误。（Comments/清晰性：逻辑本该用命名函数表达） |
| **对齐原则** | 宪法 §3 — 可读性 |
| **消除标准（验收）** | 1) 抽出 `isRequirementHistoryDelta` / `isDesignHistoryDelta`（或基于 `classifyPromoteGroup` 的表驱动）；2) 过滤器一行可读；3) 现有历史断言测试仍绿。 |
| **风险与约束** | 分桶规则与文档模板 `{deltaGroups}` 相关，改名时保持 requirement vs design 文件语义不变。 |

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-09-20 | `fe8c2cc` | 初版：IMPL-GEN-001~003、IMPL-FP-001。 |
| 0.2.0 | 2026-09-20 | — | 随 design B-T02：纯 computeDeltas + 历史谓词；GEN-001/FP-001/GEN-003 → 已消除。 |
| 0.3.0 | 2026-09-20 | — | B-T03：PromoteOptions 统一命名；GEN-002 → 已消除。 |
