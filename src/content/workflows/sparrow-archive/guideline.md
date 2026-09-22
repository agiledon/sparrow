## 执行顺序检查

- **本阶段**：sparrow-archive（第 8 步 / 共 8 步），产品级
- **前置**：非 `tbd`/`brownfield`；存在待归档 change；先读 `references/archive-gate.md` 并 `check-archive`，经用户确认
- **门控 / promote**：契约见 `archive-gate.md`；必跑 `scripts/sparrow-promote.mjs`
- 仅显式调用。绿地首次交付亦通过本技能 promote 至 `master/`
