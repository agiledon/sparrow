# 确认模式

工作目录为**项目根**。脚本在本 skill 的 `scripts/` 下。

1. 读 `references/ubiquitous-language.md` 与 `references/spec-layout-guide.md`。运行 `scripts/sparrow-state.mjs show`。
2. 若 `development-mode` 为 `tbd`：运行 `scripts/sparrow-state.mjs detect-mode`，再运行 `scripts/sparrow-state.mjs set-mode <detect-mode 输出的 mode>`。判定规则（脚本已实现）：archive 与 change 皆空且无源码 → `greenfield`；皆空且有源码 → `brownfield`；archive / change / master 已有规格 → `iteration`。
3. 若模式为 `brownfield`：告知用户 Sparrow 暂不支持棕地核心流程，**停止**。不创建 change 工作区，不 Grill Me。`pipeline` 保持为空。不要读取后续步骤。

下一步：读取 `steps/02-input.md`。不要提前打开它。
