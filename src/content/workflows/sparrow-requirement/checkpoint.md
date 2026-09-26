## 检查清单

- [ ] `sparrow-state.json` 的 development-mode 已确定且非 brownfield
- [ ] change-id 已确认且工作区在 `change/current/{id}/`
- [ ] Grill Me 按 V 模型确认，快速总结含利益相关者（Stakeholder）、价值流（Value Stream）、端到端业务流程、已命名业务服务，以及归纳后的子领域
- [ ] catalog 含价值流、结构索引，以及端到端业务流程到业务服务（Business Service）的表；无遗漏系统步骤、无孤儿业务服务
- [ ] 未达问题空间复杂度阈值（见 harness `requirement/requirements.md`）时只写 `{sd-slug}/subdomain.md` 与 `{sd-slug}/business-services.md`。达到该阈值时场景含谁、为何、何时、做什么、何处，且同场景业务服务合于该场景的 `business-services.md`。验收为中文句式；一次请求一个服务；名称动宾
- [ ] 质量属性无空章节
- [ ] 若做了 UI：操作流程回溯 EBP、无孤儿页面、原型可走通
- [ ] `project.md` 已更新且 §1.2 只链 catalog；pipeline `requirement` 为 `done`

## 下一步

执行 **/sparrow-architecture**。若有 UI 产出，architecture 阶段将同时生成 `architecture/frontend.md`。

{{PLUGIN:sparrow-ui}}
{{HARNESS}}
