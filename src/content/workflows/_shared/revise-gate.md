# revise 门控

本文件是修订入口与对账格式的单一叙述源。过程工作流在继续写规格之前先判定入口。

verify 与 archive 不是修订：不追加对账，不增加修订号。

## 入口

### 未归档修订

同时满足：

- `.sparrow/sparrow-state.json` 的 `active-change.changeId` 非空
- `docs/sparrow/change/current/{changeId}/` 存在

部分归档仍算这一类：changeId 还在。

重跑 sparrow-requirement、sparrow-architecture、sparrow-design、sparrow-model、sparrow-plan、sparrow-apply，是在修订这一份 change。不新建 change-id。规格在原路径改成全文。

### 已完整归档

同时满足：

- changeId 为空
- `change/current/` 没有未归档目录
- `change/archive/` 或 `master/` 已有规格

除 sparrow-requirement 以外的过程工作流必须停止，并请用户从 **sparrow-requirement** 开始。不得在 design、model、plan、apply 里新建 change，也不得改 `backend/`。

sparrow-requirement 将 `development-mode` 写成 `increment`，并新建 change-id。基线是 `master/` 的规格，加上仍然留在 `backend/{slug}/` 的模块。不把代码复制进新 change。

### 尚无规格

`archive/`、`change/`、`master/` 都没有规格时，从 sparrow-requirement 按 greenfield 正向执行。第一次把文件写入当前 change 记为 `r1`，语义为 ADDED，对照空基线。

## 一次修订

requirement、architecture、design、model、plan、apply 各执行一次，就是一次修订，修订号加一。同一次执行里改多份文件，仍只追加一节。

## 基线

- **Greenfield，本 change 还没有对账**：对照空基线，记 ADDED。
- **同一份未归档 change 的再次执行**：对照该 change 的上一修订版（工作区里的全文，以及 `delta.md` 最后一节）。不对照 master。
- **Increment 新 change 的 `r1`**：对照 master 规格，以及 `backend/{slug}/` 是否存在。序号从 `r1` 重新计，不接上一份 change 的号。

## 四种 Delta

- **ADDED**：新增一份 artifact，或新增一个此前不存在的标题所代表的条目
- **MODIFIED**：同一路径、同一标题下的内容变化
- **REMOVED**：删除 artifact，或删除其中的条目
- **RENAMED**：路径不变，只更名标题。路径或 slug 变了，记 REMOVED 加 ADDED，不叫 RENAMED

每次修订都必须写影响范围。

## 对账文件

路径：`docs/sparrow/change/current/{change-id}/delta.md`。

不进入 master。完整归档时留在该 change 的 `archive/` 目录。部分归档时留在 `change/current/{id}/`，不随共享物移走。change 工作区不写 `<!-- version -->`。

修订号是这一份 change 内的 `r1`、`r2`，不是 master 上的文档版本号。

文件不存在时，本次为 `r1` 并创建文件。已有节时，本次为最后一节的号加一，只追加，不改旧节。

```markdown
# 修订对账

## r1 — {skill-id} — {YYYY-MM-DD}

### 影响范围

- 触发原因：
- 受影响 slug：
  - slug：
  - 划分动作：新增 | 分给已有 | 删除 | 合并 | 拆分 | 移动聚合 | 无
  - 对应子领域：
  - 已有代码：是 | 否
  - 预定代码动作：不改 | 原模块扩展 | 绞杀者 | 防腐层 | 并入后删除 | 不适用
  - 待确认：是 | 否
- 要改的路径：
- 因此过期、本次不改的下游：
- 明确不改的限界上下文：

### Delta

| 路径 | 语义 | 说明 |
|------|------|------|
| `requirement/business/catalog.md` | ADDED | 新增文件或条目 |
| `architecture/bounded-contexts.md` | MODIFIED | 同一路径、同一标题 |
| `design/{slug}/spec.md` | REMOVED | 被删的路径或标题 |
| `design/{slug}/spec.md` | RENAMED | 旧标题 → 新标题 |
```

已有代码只看 `backend/{slug}/` 是否存在。不看当前 change 里有没有 `plan.md` 或 `code_review.md`。

`proposal.md` 与 `plan.md` 不 promote，对账里仍然记录。标题更名即使正文其余部分未改，也记 RENAMED，并写入当次影响范围。

## project.md

「变更管理」块只写当前修订号，以及指向 `delta.md` 的链接。影响范围和 Delta 清单不写入 `project.md`。

## 规格与代码

requirement 到 plan 只改规格，不改 `backend/`。

代码只在 sparrow-apply 处理，且只处理本修订影响范围里点名的 `backend/{slug}/`。未点名的模块不进入 apply。

新增限界上下文不能在 design、model、plan 或 apply 里直接起 slug。需求阶段按 `subdomain-rules.md` 判断新职责是否属于已有子领域。架构阶段先按 harness `arch/bounded-contexts.md` 做一对一映射，偏离必须写理由。没有 `backend/{slug}/` 之前不做代码迁移。

档位 S0–S4 只用来把更下游标为过期，不自动重跑下游技能。定义见 sparrow-architecture 的 `references/bc-tiers.md`。

删除、合并、绞杀者切换必须先得到用户确认。
