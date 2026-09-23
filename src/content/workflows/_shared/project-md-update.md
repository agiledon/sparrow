# project.md 更新

路径：`docs/sparrow/change/current/{activeChangeId}/project.md`。

模板：共享 `assets/project.md`（固定章节，禁止改标题层级或把「（问题空间）」标到 1.1 / 1.2 / 1.3）。

1. 若不存在，按该模板创建。
2. **必须保持**标题：`### 1. 产品需求（问题空间）`、`#### 1.1 业务需求`、`#### 1.2 质量属性`、`#### 1.3 UI 需求（可选）`、`### 2. 系统架构（解空间）`。
3. **1.1 业务需求**只更新 catalog 一条的勾选与「待生成 / 已完成」状态；禁止在 1.1 再链 `subdomains/`、`capabilities/`、`scenarios/`、`services/` 或嵌套树中的单个 SD/C/S 文件。
4. 将本阶段已生成条目从 `*待生成*` 改为已完成（change 工作区不写 version 号；master 副本用 `*v{version}*`）。
5. 更新文件头部「最后更新」时间戳。
6. 基线（无活动变更、首次需求）**不写**「变更管理」块、不标注档位。revise 模式下才创建/更新变更管理块与 BC 进度档位。
7. 不改动未本阶段负责的 BC 列表结构，除非本阶段职责就是新增/调整 slug 索引（sparrow-architecture）。
