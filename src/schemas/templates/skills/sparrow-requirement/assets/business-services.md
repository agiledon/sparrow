# 业务服务：场景 {中文名}

**场景：** S-{slug}
**所属子领域：** SD-{slug}
**所属能力：** C-{slug}（本 SD 省略能力层时写「本 SD 省略能力层」）

> 本文件合并本场景全部业务服务。每个 `## BS-{id}` 块的字段以 `assets/service.md` 为准。
> arch 切片 `source` 指向本文件对应标题（`…/business-services.md#BS-{id}`）。

## BS-{id}

**服务编号：** BS-{id}
**服务名：** {动词短语，动宾结构}
**追溯：** SD-{slug} / C-{slug} / S-{slug}
**端到端流程：** EBP-{id} 步骤 {n}

**服务描述：**
作为{角色}，
我想要{服务功能}，
以便{服务价值}。

**触发事件：** {触发事件}

**基本流程：**

1. {步骤1}；
2. {步骤2}；

**替代流程：**

1a. {异常情况1}；
2a. {异常情况2}；

**验收标准（EARS）：**

1. WHEN {触发或条件},
   THE system SHALL {可观察系统行为}。
2. IF {前置条件}, THEN THE system SHALL {行为}。
3. WHILE {状态}, THE system SHALL {行为}。

（按本场景其余业务服务重复 `## BS-{id}` 块）
