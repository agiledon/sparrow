# 业务需求目录（Catalog）

> 索引：子领域 → 能力（可选）→ 场景 → 业务服务；以及端到端业务流程覆盖表。
> 入口：`project.md` §1.2 链到本文件；本文件必须能直接或经一层链接到达每个子领域、能力、场景和业务服务。
> 变更范围内条目勾选。

## 1. 结构索引

嵌套落盘（身份在目录名）：`requirement/business/{sd-slug}/[ {c-slug}/ ]{s-slug}/`。

| 子领域 | 战略类型 | 能力 | 场景 | 业务服务（本变更） |
|--------|----------|------|------|-------------------|
| [SD-{slug}](./{sd-slug}/subdomain.md) | Core \| Supporting \| Generic | [C-…](./{sd-slug}/{c-slug}/capability.md) / 省略 | [S-…](./{sd-slug}/{c-slug}/{s-slug}/scenario.md) | [BS-…](./{sd-slug}/{c-slug}/{s-slug}/business-services.md#BS-{id}) |

省略能力层时：能力列写「省略」；场景与业务服务链接去掉 `{c-slug}/`（场景直接在 `{sd-slug}/{s-slug}/`）。

## 2. 端到端业务流程

| 端到端业务流程 | 名称 | 涉及场景 / 子领域 | 步骤序 | 步骤说明 | 对应业务服务 | 非本系统？ |
|----------------|------|-------------------|--------|----------|--------------|------------|
| EBP-{id} | {名称} | S-… / SD-… | 1 | {步骤} | [BS-…](./{sd-slug}/…/business-services.md#BS-{id}) | |
| | | | 2 | {步骤} | [BS-…](./{sd-slug}/…/business-services.md#BS-{id}) | |

> 每个需目标系统处理的步骤必须有业务服务；标明「非本系统」的步骤可不挂业务服务。
> 覆盖自检：链完整、无遗漏系统步骤、无孤儿业务服务。

## 3. 能力层是否落盘

- 该子领域能力数 **多于 3 个且不止 1 个**：写 `{c-slug}/capability.md`，场景挂在能力目录下。
- **约 ≤3 个，或本子领域仅 1 个能力**：省略能力层与 `capability.md`；场景挂在子领域目录下。Grill Me 仍确认能力，但不落盘。

## 4. 缩写

> 全项目缩写的英文全称只维护在本节。其它文档引用本节，不另建表。

| 缩写 | 英文全称 | 中文 |
|------|----------|------|
| D | Domain | 领域 |
| SD | Subdomain | 子领域 |
| C | Capability | 能力 |
| S | Scenario | 场景 |
| BS | Business Service | 业务服务 |
| EBP | End-to-end Business Process | 端到端业务流程 |
| BC | Bounded Context | 限界上下文 |
| P | Property | 属性 |
