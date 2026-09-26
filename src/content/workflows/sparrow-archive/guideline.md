## 执行顺序检查

- **本阶段**：sparrow-archive（第 8 步 / 共 8 步），产品级
- **前置**：非 `tbd`/`brownfield`；存在待归档 change；经用户确认后再动盘
- **门控 / promote**：第一步读取契约；在项目根执行 `node <本 skill 目录>/scripts/sparrow-promote.mjs`。不要把脚本复制到项目根。
- 仅显式调用。绿地首次交付亦通过本技能 promote 至 `master/`
