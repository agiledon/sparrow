## 检查清单

- [ ] 先有 SD→BC 一对一表，偏离有理由；未在 arch 重划 SD
- [ ] ReAct 迭代至验证通过后才定稿 bounded-contexts.md
- [ ] 每个 BC 有薄投影 spec；含 source 与 P-*；无流程全文副本
- [ ] 有 UI 则 frontend.md 契约绑定表无未解决的 ⚠️
- [ ] `project.md` 已列出全部 slug

## 下一步

按 project.md 中的 slug 执行 **/sparrow-design @{slug}**。各 BC 与交互上下文互相独立，可并行。

{{PLUGIN:archify}}
{{HARNESS}}
