## 执行顺序检查

- **本阶段**：sparrow-archive（第 8 步 / 共 8 步），产品级
- **前置**：`sparrow-state.json` 非 `tbd`/`brownfield`；`change/current/` 存在待归档变更；先 `check-archive` 汇总并经用户确认
- **门控**：slug 完成 = `verify` + `done`；全完成→完整归档；有未完成且用户坚持→部分归档（仅已完成）；无已完成 slug→禁止归档
- **必做**：promote 为 append-only delta（ADDED/MODIFIED/REMOVED；永不删 master）；部分归档后 `prune-contexts` 保留 changeId
- 仅显式调用。绿地首次交付亦通过本技能 promote 至 `master/`
