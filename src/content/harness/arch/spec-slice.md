# 规格切片约束（arch / spec-slice）

本文件定义 sparrow-architecture 将业务服务切片到 `design/{slug}/spec.md` 时的纪律。

## 必须（MUST）

1. **薄投影**：每个 BS 条目只写身份（id/名称/参与者）、`source` 链接、`trace`（SD/C/S/EBP）、以及 **Properties（P）**。
2. **`source` 必须**指向该 BS 所在场景的 `requirement/business/.../business-services.md#BS-{id}`（以 catalog 链接为准）。
3. **EARS → Property**：将源 BS 的每条 EARS 验收标准抽取为 `P-*`（见 skill `references/property-rules.md`）。
4. **一次请求 = 一个 BS = 下游一个 API**；切片不得合并或拆分 BS 粒度。
5. 本 BC 的 BS 集合须与 `architecture/bounded-contexts.md` 归属一致，无遗漏、无重复。

## 禁止（MUST NOT）

1. **禁止**在 spec 中复制用户故事、触发事件、基本/替代流程全文（需要时按 `source` 回读）。
2. **禁止**在解空间使用术语 **scenario** 指代验收片段（Scenario 仅用于问题空间 5W）。
3. **禁止**把一个 BS 再拆成更小的「解空间 scenario」目录树；粒度停在 **BS + 其下 P 列表**。
4. **禁止**在 BC 内复制完整的 C/S 目录树；C 最多作导航 TOC。
