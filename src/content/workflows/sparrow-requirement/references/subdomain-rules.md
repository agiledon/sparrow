# 子领域识别规则

角色：业务架构师。在 sparrow-requirement 的 Grill Me「域与子领域」维度确认后，写入 `{sd-slug}/subdomain.md` 与 catalog。

## 输入

- Grill Me 快速总结（SD 边界与战略类型）
- 原始需求；质量属性文档（若存在则必读，影响后续 BC 拆分参考，但不在本阶段做 BC）

## 第一性原理

1. **价值导向**：以业务价值识别核心子领域。
2. **内聚性**：同一 SD 内业务概念高度内聚；SD 间松耦合。
3. **战略重要性**：Core / Supporting / Generic（定义见 harness `requirement/subdomains.md`）。

## 识别步骤

1. 从需求中提取体现业务概念的**名词**；主从关系优先同组。
2. 对未归类项按业务目标做功能相关性合并（语义优先于功能）。
3. 归纳共同特征，抽象为 SD 名称（名词），判定战略类型。
4. 奥卡姆剃刀：尽量少 SD；拆分须满足 harness 充分理由。
5. 写入 `{sd-slug}/subdomain.md` 与 `catalog.md`；能力未达阈值则省略能力层。

## 禁止

见 harness `requirement/subdomains.md`（按动词/角色/技术视角划分等）。

## 与 arch 的边界

本阶段**只**产出问题空间 SD（及 C/S/BS）。**不要**识别限界上下文；arch 将先做 SD→BC 一对一映射。
