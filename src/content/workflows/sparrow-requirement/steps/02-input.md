# 收集需求输入

`greenfield` 与 `iteration` 走同一套核心流程（iteration 仍按 revise / master diff）。

**必须**遵守 harness `requirement/ingest-cli.md` 与 SKILL「包 CLI」节：

- 用户消息中的 `@path`（可多个）为显式输入，不全库搜索。对每个路径按 ingest-cli 运行 `sparrow ingest`。
- 无 `@` 时：若用户已给提示词或显式文件路径，以用户输入为准；否则在仓库内搜索 PRD/SRS（排除 `docs/sparrow/`）。搜到的文件同样 ingest 后再读 plan。无输入则停止。

下一步：读取 `steps/03-change-id.md`。不要提前打开它。
