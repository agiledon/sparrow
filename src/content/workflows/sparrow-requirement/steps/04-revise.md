# 判断是否增量修订

读 `references/revise-gate.md`。

- 本 change 还没有对账：greenfield 对照空基线，全部记 ADDED；increment 的新 change 对照 master 规格。
- 本 change 已有上一修订版：对照该版做 ADDED / MODIFIED / REMOVED / RENAMED，不对照 master。
- 在 change 工作区内把规格更新为全文，不写 version 元数据。每次都写影响范围。requirement 不改 `backend/`。新增职责先按 `references/subdomain-rules.md` 判断是否属于已有子领域。

下一步：读取 `steps/05-existence.md`。不要提前打开它。
