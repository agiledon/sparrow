# 查看或修改约束

查看：列出项目级与全局级文件。添加/更新/删除：写入对应阶段文件。用户未指定阶段时按内容自动分类。

格式：Must / Must Not；同一文件内按必须 / 禁止 / 判断标准分组。

| 约束内容 | 目标文件 |
|---------|---------|
| 业务服务 / Grill Me / EBP / EARS / UI 操作流程 | requirement/requirements.md |
| 子领域划分 | requirement/subdomains.md |
| 限界上下文 / SD→BC 映射 | arch/bounded-contexts.md |
| 规格切片 / Property | arch/spec-slice.md |
| 交互上下文 / 前端 | arch/frontend.md |
| API / 序列图 | design/api-design.md |
| DDD 四层 / 角色 | model/architecture.md |
| 聚合 / 建模 | model/domain-modeling.md |
| 代码生成 / 反模式 | apply/implementation.md |
| 跨阶段索引 | constitution.md |
| 跨阶段 always | common/always/*.md |
| 跨阶段 conditional | common/conditional/*.md |

优先级：项目级 > 全局级。新增约束对后续阶段命令即时生效。
