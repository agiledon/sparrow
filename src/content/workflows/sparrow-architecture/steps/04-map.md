# 映射限界上下文（Bounded Context）

读取 catalog 与各 `{sd-slug}/subdomain.md`。读 `references/react-mapping.md`。先将每个子领域（Subdomain） **一对一**映射为限界上下文，再按 ReAct 识别拆分/合并等调整；遵守 harness `arch/bounded-contexts.md`。修订时不重划子领域。新增限界上下文必须来自 requirement 已确认的子领域，并先完成这对一映射；偏离必须写理由。不得把新 slug 留到 design、model、plan 或 apply 才创建。

按 `assets/bounded-contexts.md` 写入 `architecture/bounded-contexts.md`。

下一步：读取 `steps/05-slice.md`。不要提前打开它。
