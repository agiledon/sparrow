# 兼容与迁移（architecture 旧路径）

见 requirement skill 同名说明；arch 执行前若检测到旧路径，按下列处理：

1. `architecture/business.md` 存在 → **不要**作为本阶段输入重做子领域；确认 requirement 侧已有 SD 后忽略或提示用户迁移。
2. `architecture/application.md` 存在而 `bounded-contexts.md` 不存在 → 迁移为 `bounded-contexts.md` 并补 SD→BC 一对一表。
3. `design/{slug}/spec.md` 仍含流程全文 → 改为薄投影 + Property（`references/property-rules.md`）。

完整表见 `sparrow-requirement/references/compat-migrate.md`（共享逻辑；本文件为 arch 入口提示）。
