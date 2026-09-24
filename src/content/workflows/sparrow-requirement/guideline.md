## 执行顺序检查

- **本阶段**：sparrow-requirement（第 1 步 / 共 8 步），产品级
- **前置**：无文档前置。先读 `.sparrow/sparrow-state.json`；`tbd` 时探测开发模式；`brownfield` 终止。
- 无 change-id 时先确认再创建工作区
- 已有 catalog 等文件时，到对应步骤再处理，不要提前打开附属文件
