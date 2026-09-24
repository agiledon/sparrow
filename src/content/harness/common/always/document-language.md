# 文档语言（common / always / document-language）

各阶段写**文档型交付物**之前，读取 `.sparrow/sparrow-config.json` 的 `lang`（BCP 47）。缺省或字段缺失时按 **`zh-Hans`**（中文简体）。

## 适用范围

**必须**使用 `lang` 对应语言撰写正文：需求（catalog、子领域、能力、场景、业务服务、质量属性）、架构、`design/{slug}/` 下的 spec / api / tech / model / plan、修订历史、`project.md`、proposal 等 Markdown 规格。

**排除**：源代码；`requirement/ui/prototypes/*.html` 等静态页面。

## 专业术语

当 `lang` 不是 `en` 时，业务专业术语与计算机专业术语在**首次出现**处用括号附英文，例如「限界上下文（Bounded Context）」。

## 缩写

缩写只出现在编号里：`SD-`、`C-`、`S-`、`BS-`、`EBP-`、`P-`。标题、字段名和句子用全称：子领域、能力、场景、业务服务、端到端业务流程、限界上下文、属性。

这些缩写的英文全称**只写在** `requirement/business/catalog.md` 的「缩写」节。其它文档不另建缩写表，需要时引用该节。
