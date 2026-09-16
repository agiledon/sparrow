# 版本元数据

**change 工作区不写** `<!-- version -->`。仅 master 或非 change 路径的文档在文件开头使用：

```
<!--
  version: v1.0
  last-updated: {ISO_8601_TIMESTAMP}
  generated-by: {skill-id}
  sparrow-version: {从 .sparrow/sparrow.json 读取}
-->
```

规则：

- 新文档：`v1.0`
- 更新已有文档：递增次版本（`v1.0` → `v1.1`）
- 重大重写：递增主版本（`v1.x` → `v2.0`）
- 每次修改必须变更版本号

revise 且写 master / 非 change 文档时，可追加 `change-id: {change-id}`（必要时 `supersedes: {被取代版本}`）。基线无活动变更时不追加这些字段。
