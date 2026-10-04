# project.md 更新

路径：`docs/sparrow/change/current/{activeChangeId}/project.md`。

模板：共享 `assets/project.md`（固定章节，禁止改标题层级或把「（问题空间）」标到 1.1 / 1.2 / 1.3 / 1.4）。

1. 正常创建点是确认 change-id、创建工作区时（`ensure-change-workspace.mjs` 按该模板写入，已存在则不覆盖）。本文件负责后续更新。文件意外缺失时仍可按该模板补写，但不是正常时机。
2. **必须保持**标题：`### 1. 产品需求（问题空间）`、`#### 1.1 变更提案`、`#### 1.2 业务需求`、`#### 1.3 质量属性`、`#### 1.4 UI 需求（可选）`、`### 2. 系统架构（解空间）`。
3. **1.2 业务需求**只更新 catalog 一条的勾选与「待生成 / 已完成」状态；禁止在 1.2 再链 `subdomains/`、`capabilities/`、`scenarios/`、`services/` 或嵌套树中的单个子领域（Subdomain）/能力（Capability）/场景（Scenario）文件。
4. 将本阶段已生成条目从 `*待生成*` 改为已完成（change 工作区不写 version 号；master 副本用 `*v{version}*`）。
5. 更新文件头部「最后更新」时间戳。
6. requirement、architecture、design、model、plan、apply 收尾时，若本次写入或更新了规格：按 `revise-gate.md` 追加 `delta.md` 一节，并在「下一步」之前维护「变更管理」块。Greenfield 第一次落盘即 `r1`，同样写入。verify 与 archive 不更新修订号。

```markdown
## 变更管理

- 当前修订：`rN`
- 对账：[delta.md](./delta.md)
```

该块只保留这两行。不把影响范围或 Delta 清单抄进来，也不改动上文固定标题。限界上下文的进度档位仍标在「限界上下文设计」索引上，用来表示下游已过期，不表示要自动重跑。
7. 不改动未本阶段负责的限界上下文列表结构，除非本阶段职责就是新增/调整 slug 索引（sparrow-architecture）。
