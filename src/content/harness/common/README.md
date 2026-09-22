# 通用约束（common）

跨阶段、跨 skill 的 harness 纪律集中在此目录。这里不是「全局级 harness」（相对项目级），而是全局级 harness 中**不属于特定阶段**、各阶段都必须遵循的公共纪律。

| 子目录 | 含义 | 加载方式 |
|--------|------|----------|
| `always/` | 每次执行命令时**必须**加载 | 由 schema `globalHarness.always` 注入各 skill |
| `conditional/` | 满足条件时**必须**额外加载 | 由 schema `globalHarness.conditional` 声明；执行前读取 `proposal.md` 等判定 |

新增跨阶段纪律：在对应子目录添加 Markdown，更新 `schema.yaml` 的 `globalHarness` 与根目录 `constitution.md` 索引（仅指针，不复制条文）。
