# 坏味道驱动重构任务（OpenMole Tasks）

**版本**：0.5.0
**状态**：草案
**依据**：[badsmells.md](./badsmells.md)
**修订日期**：2026-08-13

| 项目 | 说明 |
|------|------|
| **文档定位** | OpenMole 任务分解正式规约载体 |
| **统计范围** | `src/`（40 个 TypeScript 文件，约 7092 行） |
| **关联坏味道** | 见 [badsmells.md](./badsmells.md) |
| **级别** | IMPL |
| **提交版本** | `3f33e66` |

---

## 1. 执行约定

- **任务来源**：本文件中的任务 **必须** 根据 **[`badsmells.md`](./badsmells.md) 的当前内容** 规划与拆分。
- **标准步骤（IMPL 6 步）**：① 确认坏味道 / ② 补测 / ③ 测绿 / ④ 应用重构手法（语言感知）/ ⑤ 回归测绿 / ⑥ **用户确认**（写操作门禁）。
- **测试安全网**：本项目 **无既有测试基建**（无 `*.test.ts`、无 `test` script）。安全网为 `npm run typecheck`（`tsc --noEmit`）+ `npm run build`（esbuild）；纯逻辑提取（如版本比较）建议补 `node --test`（Node ≥18 内置）最小单测。
- **范围**：单任务 diff 应对准 `badsmells.md` 中的条目 / BS-ID；若发现新坏味道，**先更新 `badsmells.md`**，再更新本文件。
- **确认门**：**每任务完成后** 由 **用户（维护者）** 确认后，方可勾选完成并进入下一任务。
- **ID 规则**：任务 ID 为 `B-T序号`；依赖关系在条目中显式写出。
- **提交版本**：升版本文件或新增修订历史行时，填写 `git rev-parse HEAD`。

### 1.1 `badsmells.md` 迭代后的同步

当 **`badsmells.md` 版本或实质性内容变化** 时，**不得** 直接假设本文件仍有效 —— 须先完成差分与修订，**更新本文件** 后再实施重构。

---

## 2. 任务模板（复制使用）

```markdown
- [ ] **B-Txx.** 标题（消除 BS-xxx：简述）
  - **依赖**：B-Tyy 或 无。
  - **级别**：IMPL
  - **坏味道**：`badsmells.md` §2 / `BS-...`。
  - **涉及路径**：`path/to/file.ts` …
  - **步骤**：① 确认 / ② 补测 / ③ 测绿 / ④ 重构 / ⑤ 回归测绿 / ⑥ 用户确认。
  - **完成定义（DoD）**：……（可观测、可测试）
  - **SDD 联动**：否
```

---

## 3. 任务 backlog

### B-T01：消除 `catch (e: any)` 类型逃逸（消除 IMPL-TS-001）

- [x] **B-T01.** 用 `unknown` + 类型守卫替换 `update` 命令中的 `catch (e: any)`
  - **依赖**：无。
  - **级别**：IMPL
  - **坏味道**：`badsmells.md` §2 / `IMPL-TS-001`。
  - **涉及路径**：
    - `src/cli/index.ts:157` — `catch (e: any)` → `catch (e: unknown)` + 类型守卫
  - **步骤**：
    ① **确认**：确认 `src/cli/index.ts:157` 的 `catch (e: any)` 仅通过 `e?.status`、`e?.signal` 判定超时，且 `status === null && signal === 'SIGTERM'` 是 `execSync` 超时的判定依据。
    ② **补测**：本项目无测试基建，本次以编译期 + 行为不变为准；为超时判定逻辑提取一个纯谓词 `isExecSyncTimeoutError(e: unknown): boolean` 并用 `node --test` 补 3 个用例（status null+signal SIGTERM → true；普通 Error → false；非 Error → false）。
    ③ **测绿**：`npm run typecheck` 通过；新增 `node --test` 用例全绿。
    ④ **重构（语言感知：TS 类型守卫）**：
       - 定义 `interface ExecSyncTimeoutError extends Error { status: number | null; signal: string | null }`；
       - 谓词 `isExecSyncTimeoutError(e: unknown): e is ExecSyncTimeoutError` 用 `e instanceof Error` + 字段窄化；
       - `catch (e)` 后 `if (isExecSyncTimeoutError(e) && e.status === null && e.signal === 'SIGTERM')`。
    ⑤ **回归测绿**：`npm run typecheck` + `npm run build` 通过；`node --test` 全绿。
    ⑥ **用户确认**：用户确认后勾选完成。
  - **完成定义（DoD）**：
    - 全项目 `grep -rn ": any\|as any" src` 为 0 处
    - `npm run typecheck` 无错误
    - 超时提示与退出码行为与重构前完全一致
  - **SDD 联动**：否

---

### B-T02：修正 `prd-quanlity.md` 拼写并抽取路径常量（消除 IMPL-GEN-001）

- [x] **B-T02.** 将 `prd-quanlity.md` 统一修正为 `prd-quality.md`，并抽取为常量避免字符串散落
  - **依赖**：无。
  - **级别**：IMPL
  - **坏味道**：`badsmells.md` §2 / `IMPL-GEN-001`。
  - **涉及路径**：
    - `src/core/project-md.ts:58,119`
    - `src/skills/explore.ts:33,50,90,152,190,192,418,497,612`
    - `src/skills/arch.ts:22,132`
  - **步骤**：
    ① **确认**：全文搜索 `quanlity`，确认 10+ 处出现点及是否影响运行时生成的文件名。
    ② **补测**：无纯逻辑可测；以「全文替换 + 类型检查」为安全网。
    ③ **测绿**：`npm run typecheck` 通过（重构前基线）。
    ④ **重构**：
       - 在 `src/core/project-md.ts`（或新建 `src/core/paths.ts`）定义 `export const PRD_QUALITY_PATH = 'requirement/prd-quality.md'`；
       - 将 `project-md.ts`、`explore.ts`、`arch.ts` 中的 `prd-quanlity.md` 字符串替换为 `prd-quality.md` 或常量引用；
       - 校验生成的 markdown 模板中链接路径一致。
    ⑤ **回归测绿**：`grep -rn "quanlity" src` 为 0 处；`npm run typecheck` + `npm run build` 通过。
    ⑥ **用户确认**：用户确认后勾选完成。
  - **完成定义（DoD）**：
    - `grep -rn "quanlity" src` 输出为空
    - 生成产物引用的路径拼写为 `prd-quality.md`，无遗漏
    - `npm run build` 通过
  - **SDD 联动**：否

---

### B-T03：建立版本号单一真相源（消除 IMPL-GEN-002）

- [x] **B-T03.** 收敛三处框架版本魔法值，从 `package.json` 读取单一版本
  - **依赖**：建议先完成 **design/B-T02**（删除 `version.ts` 死代码，见 design/tasks.md），避免重复触碰 `version.ts`。
  - **级别**：IMPL
  - **坏味道**：`badsmells.md` §2 / `IMPL-GEN-002`。
  - **涉及路径**：
    - `src/core/init.ts:16`（`SPARROW_VERSION = '0.3.0'`）
    - `src/cli/index.ts:31`（`.version('0.3.1')`）
    - `src/core/version.ts:15`（`SPARROW_VERSION = '0.2.0'`，随 design/B-T02 删除）
  - **步骤**：
    ① **确认**：确认三处版本值 0.3.0 / 0.2.0 / 0.3.1 与 `package.json` 0.3.1 不一致，且 `init` 会把 0.3.0 写入生成文档。
    ② **补测**：无测试基建；为「从 package.json 读取版本」提取纯函数 `readPackageVersion(root): string`，用 `node --test` 补最小用例（存在/缺失 package.json）。
    ③ **测绿**：`npm run typecheck` + 新增用例全绿。
    ④ **重构（语言感知）**：
       - 新建（或复用）`readPackageVersion(root)` 作为唯一版本来源；
       - `init.ts` 移除本地 `SPARROW_VERSION`，`executeInit` 调用 `readPackageVersion(projectRoot)`；
       - `cli/index.ts` 的 `.version(...)` 与 `update` 命令的 `localVersion` 读取统一复用 `readPackageVersion`；
       - 确认 `bin/sparrow.js` 打包后仍能通过相对路径解析到 `package.json`（与现有 `update` 命令 `resolve(__dirname,'..','..','package.json')` 一致）。
    ⑤ **回归测绿**：`npm run typecheck` + `npm run build` 通过；`node --test` 全绿；`node bin/sparrow.js --version` 输出 `0.3.1`。
    ⑥ **用户确认**：用户确认后勾选完成。
  - **完成定义（DoD）**：
    - `init.ts` / `version.ts` 中不再有硬编码 `SPARROW_VERSION = '0.x.x'` 魔法值（version.ts 由 design/B-T02 删除）
    - `sparrow init` 生成的 `sparrow.json`/`project.md` 中版本号与 `package.json` 一致（0.3.1）
    - `node bin/sparrow.js --version` 与 `npm view sparrow-ddd version` 一致
  - **SDD 联动**：否

---

### B-T04：拆分 `update` 命令处理器（消除 IMPL-GEN-003）

- [x] **B-T04.** 将约 95 行的 `update` action 拆分为命名小函数，版本比较提取为纯函数
  - **依赖**：B-T03（版本真相源收敛后，拆分出的 `compareVersions` 复用统一版本工具）。
  - **级别**：IMPL
  - **坏味道**：`badsmells.md` §2 / `IMPL-GEN-003`。
  - **涉及路径**：
    - `src/cli/index.ts:133-228`（`program.command('update').action(...)`）
  - **步骤**：
    ① **确认**：确认 action 回调承担六类职责（读本地版本 / 查远端版本 / 同步 harness / 同步插件 / 比较版本 / 交互确认并安装）。
    ② **补测**：为待提取的纯函数 `compareVersions(local: string, latest: string): boolean` 用 `node --test` 补用例（相等 / 大 / 小 / 次版本 / 补丁版本）。
    ③ **测绿**：`npm run typecheck` + 新增用例全绿（锁定重构前行为）。
    ④ **重构（语言感知）**：
       - 提取 `readLocalVersion()`、`fetchLatestVersion()`、`compareVersions(local, latest)`、`syncAssets()`、`promptAndInstall(latest)` 等命名函数；
       - `compareVersions` 为纯函数，替换当前内联的 `parseVersion` + 三次比较；
       - 副作用（`console.log`、`process.exit`、`execSync`）集中到边界函数，不与纯逻辑交错。
    ⑤ **回归测绿**：`npm run typecheck` + `npm run build` 通过；`node --test` 全绿；手动执行 `node bin/sparrow.js update` 验证输出与退出码不变。
    ⑥ **用户确认**：用户确认后勾选完成。
  - **完成定义（DoD）**：
    - `update` action 回调体显著缩短，职责分解为命名函数
    - `compareVersions` 为纯函数且被 `node --test` 覆盖
    - 输出文案与退出码行为与重构前一致
  - **SDD 联动**：否

---

## 4. 执行顺序

```
B-T01 (any 消除) ── 可独立执行
B-T02 (拼写修正) ── 可独立执行
B-T03 (版本真相源) ── 建议先完成 design/B-T02（删 version.ts 死代码）
B-T04 (拆分 update) ── 依赖 B-T03
```

> **跨级别说明**：`impl/B-T03`（版本真相源）与 `design/B-T02`（删除 version.ts 死代码）都涉及 `src/core/version.ts`。建议顺序：**先 design/B-T02 删死代码，再 impl/B-T03 收敛版本来源**，避免两任务重复改动同一文件。

---

## 5. 修订历史

| 版本 | 日期 | 提交版本 | 摘要 |
|------|------|----------|------|
| 0.1.0 | 2026-08-13 | `3f33e66` | 初版：4 个任务 B-T01 ~ B-T04，覆盖 impl/badsmells.md 全部未清除条目。 |
| 0.2.0 | 2026-08-13 | `—` | B-T01 完成：新增 isExecSyncTimeoutError 类型守卫 + 3 单测；IMPL-TS-001 → 已消除。 |
| 0.3.0 | 2026-08-13 | `—` | B-T02 完成：12 处 quanlity→quality + PRD_QUALITY_PATH 常量；IMPL-GEN-001 → 已消除。 |
| 0.4.0 | 2026-08-13 | `—` | B-T03 完成：getSparrowVersion 单一真相源 + 2 单测；IMPL-GEN-002 → 已消除。 |
| 0.5.0 | 2026-08-13 | `—` | B-T04 完成：拆分 update action + compareVersions 纯函数 + 5 单测；IMPL-GEN-003 → 已消除。 |
