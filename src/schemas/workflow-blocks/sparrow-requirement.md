## 执行顺序检查

- **本阶段**：sparrow-requirement（第 1 步 / 共 8 步），产品级
- **前置**：无文档前置。先读 `.sparrow/sparrow-state.json`；`tbd` 时探测开发模式；`brownfield` 终止。ingest 见 schema **`cliCommands`** / SKILL「包 CLI」节（**非** `scripts/`）。用户 `@path` 时在**项目根**运行 **`sparrow ingest <path>`**；只读 `.sparrow/ingest/` 与 `read-plan.json` 的 `command`。CLI 不可用则停止，禁止自写 docx/pdf 解析
- 无 change-id 时先确认再创建工作区（见 SKILL.md 与 `scripts/ensure-change-workspace.mjs`）
- 已存在 catalog / `business-services.md` 等文件时按 `references/output-existence-check.md` 处理
