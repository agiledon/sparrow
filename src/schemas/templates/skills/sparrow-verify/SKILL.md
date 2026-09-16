# Sparrow Verify — 规格与代码对照

## 完成标准

相对 `docs/sparrow/change/current/{activeChangeId}/`：

- `assets/verify_report.md` → `design/{slug}/verify_report.md`，问题按 P0–P3 分级并给出建议
- 更新 `project.md`

## 步骤

1. 读 `references/ubiquitous-language.md`。未指定 slug 时从 `project.md` 列出，可选单个、多个或全部。
2. 门禁：该 slug 须已 apply（`plan.md` 全 `[x]` 且 `code_review.md` 存在）；否则提示并跳过。
3. 对照 `spec.md`、`api.md`、`tech.md`、`model.md` 与代码，按完整性 / 正确性 / 一致性检查。
4. 分级：P0 阻塞、P1 严重、P2 一般、P3 建议。按模板写入报告。
5. 读 `references/project-md-update.md`。

## 下一步

- 存在 P0 或 P1：列出阻塞项，不提示 archive；修复后重新 verify。
- 无 P0/P1：该 slug 通过。全部相关 slug 通过后，revise 模式执行 **sparrow-archive**。

{{HARNESS}}
