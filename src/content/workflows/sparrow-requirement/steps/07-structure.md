# 落盘子领域结构

读 `references/subdomain-rules.md`。

按下列模板写入（省略能力层时去掉 `{c-slug}/`；未达阈值则不建该层、不写 capability）：

- `assets/catalog.md` → `requirement/business/catalog.md`
- `assets/subdomain.md` → `requirement/business/{sd-slug}/subdomain.md`
- 能力达阈值：`assets/capability.md` → `requirement/business/{sd-slug}/{c-slug}/capability.md`，场景在能力下
- 能力达阈值时场景路径为 `requirement/business/{sd-slug}/{c-slug}/{s-slug}/scenario.md`；否则去掉 `{c-slug}/`：`assets/scenario.md` → `requirement/business/{sd-slug}/{s-slug}/scenario.md`

未达阈值时不要打开 `assets/capability.md`。

下一步：读取 `steps/08-services.md`。不要提前打开它。
