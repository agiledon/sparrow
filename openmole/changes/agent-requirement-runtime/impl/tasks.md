# 坏味道驱动重构任务（OpenMole Tasks）

**版本**：0.1.0
**状态**：草案
**依据**：[badsmells.md](./badsmells.md)
**修订日期**：2026-09-22

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 任务分解正式规约载体 |
| **关联坏味道** | 见 [badsmells.md](./badsmells.md) |
| **级别** | IMPL |
| **提交版本** | `461c270237ee49b2bc28bb4e9aa13986b88a911e` |

---

## 1. 执行约定

- **标准步骤（IMPL 6 步）**：① 确认 / ② 补测 / ③ 测绿 / ④ 应用重构 / ⑤ 回归测绿 / ⑥ **用户确认**。
- **测试安全网**：`npm test`（ingest、CLI 若有）；`node bin/sparrow.js --version` smoke。
- **建议顺序**：B-T01（launcher）→ B-T02（projectRoot CLI）→ B-T03（command 常量）→ B-T04（ensure state）。

---

## 2. 任务 backlog

### B-T01：tsx 缺失时明确报错（消除 IMPL-GEN-008）

- [x] **B-T01.** `bin/sparrow.js` 在 src 存在但 tsx 不可解析时提示 `npm install`
  - **依赖**：无。
  - **级别**：IMPL
  - **坏味道**：`badsmells.md` §2 / `IMPL-GEN-008`。
  - **涉及路径**：`bin/sparrow.js`
  - **步骤**：
    ① **确认**：静默 fall through 到 dist 报错误导。
    ② **补测**：可选脚本测或文档 smoke（publish 路径无 src 不变）。
    ③ **测绿**：现有 CI。
    ④ **应用重构**：tsx 分支 else 分支 stderr 说明；仍可尝试 dist。
    ⑤ **回归测绿**：本地 `node bin/sparrow.js --help`（有 tsx / 无 tsx 两场景人工或测）。
    ⑥ **用户确认**。
  - **完成定义（DoD）**：满足 IMPL-GEN-008 消除标准；publish 安装行为不变。
  - **SDD 联动**：否

---

### B-T02：CLI 接线 `--project-root`（消除 IMPL-GEN-009）

- [ ] **B-T02.** ingest / ingest show / ingest clean 传递 `IngestOptions.projectRoot`
  - **依赖**：无（为 `arch`/`design` B-T01 的实现前提）。
  - **级别**：IMPL
  - **坏味道**：`badsmells.md` §2 / `IMPL-GEN-009`。
  - **涉及路径**：`src/cli/index.ts` L273–307；ingest CLI 集成测（新建或扩展现有）
  - **步骤**：
    ① **确认**：core 支持 options，CLI 未传。
    ② **补测**：cwd 子目录 + `--project-root` 指向项目根命中 cache。
    ③ **测绿**。
    ④ **应用重构**：commander `.option('--project-root', …)` 三处 action。
    ⑤ **回归测绿**：ingest 全套测试。
    ⑥ **用户确认**。
  - **完成定义（DoD）**：CLI 与单测路径一致；默认 cwd 兼容。
  - **SDD 联动**：否
  - **跨级别**：解锁 `arch` B-T01、`design` B-T01。

---

### B-T03：read-plan 与 CLI 共享 show 命令常量（消除 IMPL-GEN-011）

- [ ] **B-T03.** 导出 ingest show 命令前缀，read-plan 与 commander 同源
  - **依赖**：B-T02（若 command 含 `--project-root` 片段一并常量化）。
  - **级别**：IMPL
  - **坏味道**：`badsmells.md` §2 / `IMPL-GEN-011`。
  - **涉及路径**：`src/core/ingest/read-plan.ts`；可选 `src/core/ingest/cli-strings.ts`；`read-plan` 单测 snapshot
  - **步骤**：
    ① **确认**：硬编码 `sparrow ingest show`。
    ② **补测**：command snapshot / 常量导出测。
    ③ **测绿**。
    ④ **应用重构**：Extract Constant；read-plan 引用。
    ⑤ **回归测绿**。
    ⑥ **用户确认**。
  - **完成定义（DoD）**：重命名子命令只需改一处；旧 read-plan 兼容策略 documented。
  - **SDD 联动**：否

---

### B-T04：ensure 删除内联 loadState（消除 IMPL-GEN-010）

- [ ] **B-T04.** ensure 通过 sparrow-state 脚本查询/写入，删除弱 normalize
  - **依赖**：`arch/tasks.md` B-T04 / `design` B-T03（同 refactor）。
  - **级别**：IMPL
  - **坏味道**：`badsmells.md` §2 / `IMPL-GEN-010`。
  - **涉及路径**：`ensure-change-workspace.mjs`；`sparrow-state.mjs`
  - **步骤**：
    ① **确认**：静默 catch、字段丢弃与 state 脚本不一致。
    ② **补测**：spawn 脚本对比 JSON 输出。
    ③ **测绿**。
    ④ **应用重构**：exec/spawn 子命令；删 duplicate parse。
    ⑤ **回归测绿**：脚本冒烟。
    ⑥ **用户确认**。
  - **完成定义（DoD）**：ensure 与 show 同一 state 视图；仅 Node 内置模块。
  - **SDD 联动**：是 — 模板 mjs + sync-schema。

---

## 3. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-09-22 | `461c270237ee49b2bc28bb4e9aa13986b88a911e` | 初版：B-T01~B-T04 对应 IMPL-GEN-008~011。 |
| 0.1.1 | 2026-09-22 | — | B-T01 完成（IMPL-GEN-008 已消除）。 |
