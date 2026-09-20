## 执行顺序检查

- **本阶段**：sparrow-archive（第 8 步 / 共 8 步），产品级
- **前置**：`sparrow-state.json` 非 `tbd`/`brownfield`；`change/current/` 存在待归档变更；全部 slug 的 verify 无 P0/P1（或用户确认忽略）
- 仅显式调用。绿地首次交付亦通过本技能 promote 至 `master/`
