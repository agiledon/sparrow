# 业务需求目录（Catalog）

> 索引：价值流（Value Stream）、端到端业务流程与业务服务（Business Service）。达到问题空间复杂度阈值（Problem-space Complexity Threshold）时另含能力（Capability）与场景（Scenario）；未达到时只有子领域（Subdomain）与业务服务。阈值见 harness `requirement/requirements.md`。
> 入口：`project.md` §1.2 链到本文件；本文件必须能直接或经一层链接到达每个已落盘的子领域和业务服务。
> 变更范围内条目勾选。

## 1. 价值流

价值流是一组端到端活动，为外部客户或内部用户创造一个有价值的结果。它说明企业为客户创造什么价值，以及如何创造。一条价值流可以有多条端到端业务流程。不单独建价值流文件。

| 价值流 | 为谁创造价值 | 有价值的结果 | 端到端业务流程 |
|--------|--------------|--------------|----------------|
| {名称} | {外部客户或内部用户} | {结果} | EBP-{id} |

## 2. 结构索引

未达问题空间复杂度阈值：能力与场景写「省略」。业务服务文件在 `{sd-slug}/business-services.md`。

| 子领域 | 战略类型 | 能力 | 场景 | 业务服务（本变更） |
|--------|----------|------|------|-------------------|
| [SD-{slug}](./{sd-slug}/subdomain.md) | Core \| Supporting \| Generic | 省略 | 省略 | [BS-…](./{sd-slug}/business-services.md#BS-{id}) |

达到问题空间复杂度阈值：路径为 `{sd-slug}/{c-slug}/{s-slug}/`。用下表替换上一表，不要两套并存。

| 子领域 | 战略类型 | 能力 | 场景 | 业务服务（本变更） |
|--------|----------|------|------|-------------------|
| [SD-{slug}](./{sd-slug}/subdomain.md) | Core \| Supporting \| Generic | [C-…](./{sd-slug}/{c-slug}/capability.md) | [S-…](./{sd-slug}/{c-slug}/{s-slug}/scenario.md) | [BS-…](./{sd-slug}/{c-slug}/{s-slug}/business-services.md#BS-{id}) |

## 3. 端到端业务流程

按上一节的价值流分组填写。

| 价值流 | 端到端业务流程 | 名称 | 涉及子领域 | 步骤序 | 步骤说明 | 对应业务服务 | 非本系统？ |
|--------|----------------|------|------------|--------|----------|--------------|------------|
| {价值流} | EBP-{id} | {名称} | SD-… | 1 | {步骤} | [BS-…](./{sd-slug}/business-services.md#BS-{id}) | |
| | | | | 2 | {步骤} | [BS-…](./{sd-slug}/business-services.md#BS-{id}) | |

四层时「涉及子领域」可写成「涉及场景 / 子领域」（S-… / SD-…），业务服务链接改为 `{sd-slug}/{c-slug}/{s-slug}/business-services.md#BS-{id}`。

> 每个需目标系统处理的步骤必须有业务服务；标明「非本系统」的步骤可不挂业务服务。
> 覆盖自检：链完整、无遗漏系统步骤、无孤儿业务服务。

## 4. 缩写

> 编号使用下列前缀。正文用中文全称；每份文档第一次出现时在中文后附英文。限界上下文的编号是目录名 slug，不写 `BC-`。

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
