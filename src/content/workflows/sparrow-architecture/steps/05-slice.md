# 切片 spec

为每个 BC 创建 `design/{slug}/`。读 `references/property-rules.md` 与 harness `arch/spec-slice.md`，从 EARS 抽取 Properties。按 `assets/spec.md` 把归属该 BC 的 BS 薄投影写入 `design/{slug}/spec.md`。

- 若 `requirement/ui/` 存在：下一步只读取 `steps/06-ui.md`。
- 否则不要打开前端模板。若本次为 revise：下一步只读取 `steps/07-revise.md`；否则下一步只读取 `steps/08-index.md`。
