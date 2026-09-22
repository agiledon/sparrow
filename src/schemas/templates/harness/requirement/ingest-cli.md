# 原始需求文档 ingest（requirement）

> **Sparrow 包 CLI**（workflow schema `cliCommands.ingest`）。**不要**通过 skill `scripts/` 包装 ingest。

## MUST

1. 在**项目根**直接调用 **`sparrow ingest <path>`**（可按 `read-plan.json` 使用 **`--project-root`**）。
2. 只读 **`.sparrow/ingest/`** 与该次 **`read-plan.json`**；对清单项 **原样执行** 各条 `command`（`sparrow ingest show …`）。
3. ingest 进度只在 **stderr**；禁止用模型复述进度。
4. 执行前确认 **`sparrow` 可用**（`sparrow --version` 或 `npx sparrow-ddd --version`）；不可用则停止并提示安装 `npm install -g sparrow-ddd` 或项目内 `npm install sparrow-ddd`。

## MUST NOT

1. **禁止**通过 skill **`scripts/`** 包装 ingest。
2. **禁止**用 Python、unzip 手工解 docx/pdf 或模型直接读二进制文档。
3. **禁止**打开 read-plan 清单外文件、禁止自摘要、禁止看图像素或模型描述图。
