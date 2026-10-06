# 原始需求文档 ingest（requirement）

> **Sparrow 包 CLI**（workflow schema `cliCommands.ingest`）。**不要**通过 skill `scripts/` 包装 ingest。

## 按文件类型

扩展名大小写不敏感。多个 `@path` 逐个判断。

- **直接读取，不执行 ingest**：`.md`、`.markdown`、`.txt`、`.text`。读取该文件全文，作为这份需求输入。不写 `.sparrow/ingest/`，不读 `read-plan.json`。
- **必须 ingest**：`.doc`、`.docx`、`.pdf`。

## MUST

1. 对必须 ingest 的路径，在**项目根**直接调用 **`sparrow ingest <path>`**（可按 `read-plan.json` 使用 **`--project-root`**）。纯文本与 Markdown 跳过本条。
2. ingest 之后只读 **`.sparrow/ingest/`** 与该次 **`read-plan.json`**；对清单项 **原样执行** 各条 `command`（`sparrow ingest show …`）。直接读取的文件不受本条限制。
3. ingest 进度只在 **stderr**；禁止用模型复述进度。
4. 仅当本次输入含 `.doc`、`.docx` 或 `.pdf` 时，执行前确认 **`sparrow` 可用**（`sparrow --version` 或 `npx sparrow-ddd --version`）；不可用则停止并提示安装 `npm install -g sparrow-ddd` 或项目内 `npm install sparrow-ddd`。可读取 **`.sparrow/cli-readiness.json`**（`sparrow init` / 在项目根 `sparrow update` 后写入）。只有纯文本或 Markdown 时不因此检查。

## MUST NOT

1. **禁止**通过 skill **`scripts/`** 包装 ingest。
2. **禁止**用 Python、unzip 手工解 docx/pdf 或模型直接读二进制文档。
3. **ingest 路径禁止**打开 read-plan 清单外文件、禁止自摘要、禁止看图像素或模型描述图。直接读取的纯文本与 Markdown 不受本条限制。
