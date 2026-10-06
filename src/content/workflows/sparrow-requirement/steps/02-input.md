# 收集需求输入

`greenfield` 与 `increment` 走同一套核心流程。基线差别见 `references/revise-gate.md`：同一份未归档 change 对照上一修订版；increment 新 change 的 `r1` 对照 master。

**必须**遵守 harness `requirement/ingest-cli.md` 与 SKILL「包 CLI」节：

- 用户消息中的 `@path`（可多个）为显式输入，不全库搜索。`.md`、`.markdown`、`.txt`、`.text` 直接读取全文，不运行 `sparrow ingest`。`.doc`、`.docx`、`.pdf` 按 ingest-cli 运行 `sparrow ingest`，再只按 read-plan 阅读。
- 无 `@` 时：若用户已给提示词或显式文件路径，以用户输入为准；否则在仓库内搜索 PRD/SRS（排除 `docs/sparrow/`）。搜到的文件按同样的扩展名规则处理。无输入则停止。

下一步：读取 `steps/03-change-id.md`。不要提前打开它。
