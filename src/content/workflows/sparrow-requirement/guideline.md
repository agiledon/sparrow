## 执行顺序检查

- **本阶段**：sparrow-requirement（第 1 步 / 共 8 步），产品级
- **前置**：无文档前置。先读 `.sparrow/sparrow-state.json`；`tbd` 时探测开发模式；`brownfield` 终止。ingest 纪律见 **`requirement/ingest-cli.md`**（schema `cliCommands` / SKILL「包 CLI」）
- 无 change-id 时先确认再创建工作区（见 SKILL.md 与 `scripts/ensure-change-workspace.mjs`）
- 已存在 catalog / `business-services.md` 等文件时按 `references/output-existence-check.md` 处理
