# 子领域（Subdomain）识别规则

角色：业务架构师。在 V 模型右侧归纳完成后，写入 `{sd-slug}/subdomain.md` 与 catalog。硬性规则以 harness `requirement/requirements.md`「需求结构 V 模型」「问题空间复杂度阈值」与 `requirement/subdomains.md` 为准。本文件只写落盘，不重复阈值数字。

## 输入

- 已命名的业务服务，及其所在端到端业务流程步骤
- 已确认的利益相关者与参与者
- 价值流（Value Stream）
- 原始需求中要解决的业务问题与目标
- 质量属性文档（若存在则必读，影响后续限界上下文（Bounded Context）拆分参考，但不在本阶段做限界上下文）

## 何时用两层、何时用四层

未达问题空间复杂度阈值：只归纳子领域。不写 `scenario.md` 与 `capability.md`。业务服务写入 `requirement/business/{sd-slug}/business-services.md`。

达到问题空间复杂度阈值：先归纳场景，再归纳能力，最后归纳子领域。路径为 `requirement/business/{sd-slug}/{c-slug}/{s-slug}/`。

## 归纳步骤

未达问题空间复杂度阈值时，从第 3 步开始，输入改为业务服务。

1. **业务场景**。按业务相关性，用场景五问（谁、为何、何时、做什么、何处）把内聚的业务服务收成场景。
2. **业务能力**。由场景再归纳。颗粒度同时看独立性、稳定性和管理：不能独立运作就合并；分解之后仍能独立运作，或存在多个责任主体，就继续拆分。
3. **子领域**。从要解决的业务问题和目标出发再归纳。名称是名词。至少有一个子领域。类别按 harness：竞争优势与业务复杂度 / 不可替代性都高为核心（Core）；都低为通用（Generic）；一高一低为支撑（Supporting）。
4. 写入 `{sd-slug}/subdomain.md` 与 `catalog.md`。四层时同时写入 `capability.md` 与 `scenario.md`。

## 禁止

见 harness `requirement/subdomains.md`（按动词、角色或技术视角划分等）。

## 与 arch 的边界

本阶段**只**产出问题空间的子领域；四层时另产出能力（Capability）、场景（Scenario）与业务服务（Business Service）。**不要**识别限界上下文；arch 将先做子领域到限界上下文的一对一映射。
