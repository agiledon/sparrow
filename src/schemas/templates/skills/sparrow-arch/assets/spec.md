# {限界上下文中文名} 业务服务切片

## 映射

| SD | BC slug | 备注 |
|----|---------|------|
| SD-{slug} | {slug} | 一对一 / 调整理由 |

## 业务服务

> 薄投影：叙事全文见 `source`；本文件只保留身份、追溯与 Properties。
> 禁止复制用户故事 / 基本·替代流程全文；禁止用「scenario」指代验收片段。

### BS-{id} {服务名称}

- **参与者**：{角色}
- **source**：`../../requirement/business/{sd-slug}/{c-slug}/{s-slug}/business-services.md#BS-{id}`（省略能力层时去掉 `{c-slug}/`；以 catalog 链接为准）
- **trace**：SD-{slug} / C-{slug} / S-{slug} / EBP-{id}#{n}
- **properties**：
  - **P-{id}**：For any {量化范围}, {系统行为不变量}。（`from: EARS#1`）
  - **P-{id}**：…（`example-only` 若不可普遍量化）
