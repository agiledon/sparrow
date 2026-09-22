# EARS → Property 抽取规则

角色：架构师。在 sparrow-arch 切片 `design/{slug}/spec.md` 时，将问题空间业务服务的 **EARS 验收标准**抽取为解空间 **Property（P）**。

## 定义

- **EARS**（问题空间）：`WHEN` / `IF … THEN` / `WHILE` + `THE system SHALL …`，写在场景的 `business-services.md` 对应 `## BS-{id}` 块。
- **Property（P）**（解空间）：普遍量化命题或不变量，句式倾向 **For any / For every**；挂在 BC 内该 BS 下。

## 转换示例

```text
EARS:
  WHEN user submits valid credentials,
  THE system SHALL return a JWT

Property P-login-token:
  For any valid credential pair, the login function returns a token with valid structure.
  (from: EARS#1)
```

## 规则

1. 每条可量化的 EARS **必须**生成至少一条 `P-*`，并注明 `from: EARS#n`。
2. 优先表达不变量、往返、幂等、保序等「形状」，而非再写一条 WHEN/SHALL。
3. 不能普遍量化的 EARS 标为 `example-only`，仍保留可测试断言句，**禁止**伪造成虚假的 For any。
4. Property id 稳定（`P-{kebab}`）；下游 design / model / apply / 测试以 P 为验收锚点。
5. **不**在 spec 中保留 EARS 全文副本（可一行引用编号）；叙事细节回链 `source` BS 文件。

## 下游消费

- **design**：API 行为须满足相关 P。
- **model / apply / verify**：实现与测试核对 P；无需在解空间再造 scenario 术语。
