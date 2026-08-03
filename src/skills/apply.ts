/**
 * Sparrow Apply skill template.
 *
 * This skill executes the implementation plan to generate DDD-structured code.
 * It drives three roles: QA Engineer, Development Engineer, and Code Review.
 */

import { registerSkillTemplate } from '../core/skill-generation.js';

const APPLY_BODY = `# Sparrow Apply — 按实现计划执行代码生成

## 执行顺序检查

\`\`\`
当前步骤：sparrow-apply（第 6 步 / 共 6 步）
所属层级：团队级（team-level），针对特定限界上下文
前置条件：docs/sparrow/design/{slug}/plan.md 必须存在
后续步骤：无（这是最后一步，但可以对其他限界上下文继续执行 sparrow-design → sparrow-model → sparrow-plan → sparrow-apply）
\`\`\`

**前置条件检查**：
- 如果 \`docs/sparrow/design/{slug}/plan.md\` 不存在，请提示用户先执行 **sparrow-plan @{slug}**
- 如果用户未指定限界上下文，请列出可用的限界上下文让用户选择
- 如果 plan.md 中的所有步骤都已标记为 \`- [x]\`，说明当前上下文已执行完毕

---

## 代码目录检查

在开始执行之前：

1. 检查 \`backend/\` 目录是否已存在：
   - **如果已存在**：直接使用该目录，不重新创建项目脚手架
   - **如果不存在**：创建该目录及项目脚手架

> 所有产品代码统一放在 \`backend/\` 下。多个限界上下文共享该目录，各上下文为不同的包/模块。

---

## 角色定义

你驱动三个角色按 plan.md 执行任务：

1. **Development Engineer** (\`dev\`)：产品代码（DDD 四层 + 领域 TDD）
2. **QA Engineer** (\`qa\`)：集成测试、API/契约测试
3. **Code Review**：代码评审，生成 code_review.md

---

## 变更模式（revise）— 重构迁移与边界回归

> **⚠️ 门控声明（向后兼容硬性约束）**：本节仅在**检测到活动变更**时进入。**若当前为首次需求、无活动变更，请忽略本节，完全按上文原始流程执行（即按 plan.md 正向生成代码），行为须与未引入本节前完全一致。**

**触发条件**（同 sparrow-arch「变更处理 / revise」章节）：\`docs/sparrow/changes/\` 含未归档变更文件夹，或 \`project.md\` 当前 change-id 非空。

**revise 行为总览**：本阶段只处理**档位 == S4（代码已生成）且被本次变更影响**的 BC。BC↔\`backend/\` 模块 1:1，因此 arch 记录的重构动作直接映射为代码动作。执行前先读取 \`changes/{change-id}/\` 下 arch 写好的 ADR / 动作记录，确定每个受影响 slug 的目标拓扑。

### 代码动作映射（仅 S4 执行）

- **新增 BC（新建 slug）**：按正常正向流程跑 apply，在 \`backend/\` 下新建模块。
- **合并 A+B→C（Strangler 式）**：
  1. 保留 A、B 现有模块不动；新建吸收/目标模块 C（若 C 为新 slug，正向 apply；若 C 即 A 或 B 之一，则在原模块上扩展）。
  2. 将待合并的行为与数据迁入 C；A、B 通过 facade / 协调层 / ACL 委派到 C（并存期）。
  3. **cutover**（破坏性，需用户确认）：将调用方重定向到 C。
  4. **退役**：移除 A、B 的 \`backend/\` 模块；若有外部调用方，先保留薄兼容 shim/ACL，确认无调用后再删。
- **删除 BC**：行为已并入吸收方后，移除非空模块；外部调用方经薄 shim/ACL 过渡后退役。
- **移动聚合（X 从 A→B）**：将 \`domain/aggregate|entity|valueobject/\` 与 \`infrastructure/port|adapter/\` 从 A 模块搬迁到 B 模块；同步 A、B 的 \`api/model\`；跨 BC 调用方经 ACL 保持聚合外部契约稳定。
- **防腐层 ACL**：仅新增 \`infrastructure/adapter/acl/\`（或独立 ACL 模块），做上游模型→本地模型翻译，**不改动本地领域模型**。
- **绞杀者 Strangler**：旧模块保留，新模块并行构建，经 facade / 特性开关路由；并存期双写或事件桥接；cutover 后退役旧模块。
- **数据迁移**：若 \`tech.md\` 标明「每 BC 独立 schema」，合并/拆分即跨模块 schema 迁表，并存期双写/CDC，再 cutover。

### 架构边界回归校验（fitness function）

每次代码迁移后，执行轻量边界校验，确保新模块边界未退化（呼应演进式架构「恰当耦合」支柱）：
1. 每个 BC 模块只 import 自身 \`domain/\`、\`application/\`、\`api/\`、\`infrastructure/\` 内部类型；不得直接 import 另一 BC 模块的领域类型（须经其公开 API / ACL）。
2. 若 \`tech.md\` 声明「每 BC 独立 schema」，各模块不得直接访问他模块的数据表。
3. 跨 BC 调用一律经 \`api/\` 或 \`infrastructure/adapter/\`（ACL）边界。
4. 公开 API 契约（来自 \`api.md\`）在迁移前后保持一致（除非本次变更显式修改）。

校验不通过则停下并报告，不得带病推进。

### 收尾
- 变更后重跑 **Code Review** 生成/更新 \`docs/sparrow/design/{slug}/code_review.md\`。
- 受影响模块代码版本递增（在 \`project.md\` 或模块说明中记录），元数据块追加 \`change-id\`。
- 全部受影响 S4 slug 完成后，提示用户执行 **sparrow-archive** 归档本次变更。

> 完整 BC→代码映射与数据迁移策略见 \`docs/prd/sparrow-change-management.md\` 第 6 节。

---

## 必读规约

- \`docs/sparrow/design/{slug}/plan.md\` — 执行计划（以 plan 为准的执行顺序）
- \`docs/sparrow/design/{slug}/spec.md\` — 场景与验收
- \`docs/sparrow/design/{slug}/api.md\` — 对外契约
- \`docs/sparrow/design/{slug}/tech.md\` — 技术栈与工具链
- \`docs/sparrow/design/{slug}/model.md\` — 领域模型（静态 + 动态）

---

## 代码与模型一致性（核心约束）

代码实现**必须**与 \`docs/sparrow/design/{slug}/model.md\` 中定义的领域模型保持严格一致。

### 领域层一致性

| model.md 元素 | 代码实现 | 一致性要求 |
|--------------|---------|-----------|
| 聚合根 | domain/aggregate/ | 属性名、方法名、类型必须与类图中的定义一致 |
| 实体 | domain/entity/ | 属性名、方法名、类型必须与类图中的定义一致 |
| 值对象 | domain/valueobject/ | 属性名、不可变性必须与类图中的定义一致 |
| 领域服务 | domain/service/ | 方法签名必须与序列图中的调用一致 |

### 非领域层一致性

| model.md 中的角色 | 代码实现 | 一致性要求 |
|------------------|---------|-----------|
| 远程服务 (Command/Query) | api/command/ 或 api/query/ | 方法签名与任务树根节点一致 |
| 应用服务 (AppService) | application/ | 方法签名与任务树第二层一致 |
| 端口 (Repository/Client) | infrastructure/port/ | 接口方法签名与序列图中的端口调用一致 |
| 适配器 | infrastructure/adapter/ | 实现 port 接口，方法签名一致 |

### 命名风格转换

**model.md 使用 UML 命名风格**（PascalCase 类名 + camelCase 方法名）。代码实现时，需要按照选定语言的编码规范进行转换：

| 元素 | UML (model.md) | Java | Python | TypeScript | Go | Rust | C++ |
|------|---------------|------|--------|------------|-----|------|-----|
| 类/接口名 | PascalCase | PascalCase | PascalCase | PascalCase | PascalCase | PascalCase | PascalCase |
| 方法/函数名 | camelCase | camelCase | snake_case | camelCase | PascalCase | snake_case | snake_case |
| 属性/字段名 | camelCase | camelCase | snake_case | camelCase | PascalCase | snake_case | snake_case |
| 文件名 | (无) | PascalCase | snake_case | kebab-case | snake_case | snake_case | snake_case |
| 包/模块名 | (无) | 全小写 | snake_case | kebab-case | 全小写 | snake_case | 全小写 |

> **关键**：命名风格可以不同，但**语义必须一致**。例如 model.md 中的 `placeOrder()` 在 Python 中应写为 `place_order()`，在 Go 中应写为 `PlaceOrder()`。

### 领域对象封装规则

代码实现时，**必须确保**以下封装约束：

| 规则 | 说明 | 反模式 |
|------|------|--------|
| 不生成默认 get/set | 不默认为每个属性生成访问器 | 为 `name`、`age` 等字段生成 `getName()` / `setName()` |
| 聚合根字段 private | 使用最严格的可见性修饰符 | public 字段允许外部直接赋值，绕过业务规则 |
| 聚合间 ID 引用 | 跨聚合引用时只用 ID，不直接持有对象引用 | `order.getCustomer().getAddress()` |
| 值对象不可变 | 构造时初始化所有字段，无修改方法 | 值对象包含 setter 或 mutable 字段 |
| 业务操作为主 | 聚合根暴露体现业务意图的方法 | `setStatus(Status.APPROVED)` 代替 `approve()` |
| 不暴露内部集合 | 不直接返回聚合内的 List/Map 引用 | `getItems()` 返回内部 ArrayList 引用，外部可直接 add/remove |

---

## DDD 四层 + 菱形对称架构

\`\`\`
api 层（北向网关）:
  api/command/  — 命令处理器（*Command）
  api/query/    — 查询处理器（*Query）
  api/dto/      — 消息契约（*Request/*Response/*Event）

application 层（北向网关）:
  application/  — 应用服务（*AppService），编排领域层与基础设施层

domain 层（领域核心）:
  domain/aggregate/    — 聚合根
  domain/entity/       — 实体
  domain/valueobject/  — 值对象
  domain/service/      — 领域服务（*Service）

infrastructure 层（南向网关）:
  infrastructure/port/repository/    — 资源库端口（接口）
  infrastructure/port/client/         — 客户端端口（接口）
  infrastructure/adapter/repository/ — 资源库适配器（实现）
  infrastructure/adapter/client/     — 客户端适配器（实现）
\`\`\`

---

## 执行方映射

### dev 任务（Development Engineer）
- 产品代码写入 \`backend/\` 模块
- **领域层须 TDD**：先写测试，再写实现
- 同一步骤内完成测试 + 实现
- 每生成完整文件内容，立即写入磁盘

### qa 任务（QA Engineer）
- 集成测试写入 \`integration-tests/{slug}/\`
- 覆盖 API/契约/集成场景
- **禁止**领域层单元测试（领域 TDD 属于 dev）

### Code Review（全部 dev + qa 任务完成后）
- 运行检查并生成 \`docs/sparrow/design/{slug}/code_review.md\`
- 验证代码是否符合 tech.md 的技术栈要求
- 验证是否符合对应语言的编码规范

---

## 领域 TDD 流程

对每个 dev 任务中的领域层步骤：

1. **先写测试文件**：根据 model.md 中的聚合定义和序列图，编写单元测试
2. **再写实现文件**：实现聚合根、实体、值对象、领域服务，使其通过测试
3. **同一步骤内完成**：禁止先写所有测试再写所有实现（必须在一个步骤内完成测试+实现对）

---

## 执行流程

1. 读取 \`plan.md\`，按任务顺序解析
2. 对每个 \`## 任务\`：
   - 根据 \`执行方\` 确定由 dev 或 qa 执行
   - 按顺序执行任务下的每个 \`- [ ]\` 步骤
   - 每步完成后验证产物（检查文件是否生成）
3. 全部任务完成后，将已完成的步骤标记为 \`- [x]\`
4. 执行 Code Review，生成 code_review.md

---

## 语言级规则参考

根据 tech.md 中选定的语言，遵循对应的编码规范：

### 通用规则
- 所有语言：遵循 DDD 四层目录结构
- 领域层不依赖框架/数据库具体类型
- api 层不写领域规则
- infrastructure 层 port 为接口，adapter 为实现
- **领域对象必须富含行为**：聚合根和实体应包含业务操作，而非仅为数据容器（反贫血模型）
- **禁止生成不必要的 getter/setter**：不默认为每个属性生成 getXxx() / setXxx() 方法，仅在外部确实需要读取或修改时、通过明确的业务操作暴露
- **封装内部状态**：使用语言支持的最严格访问修饰符（private/protected），属性不直接对外暴露
- **信息专家模式**：操作分配给拥有该操作所需数据的对象，而非将所有逻辑集中在领域服务中
- **迪米特法则**：聚合间通过 ID 引用，不跨聚合直接持有对象引用；避免链式调用 `a.getB().getC().doX()`

### 语言特定反模式

**Java**：
- 领域层不要依赖 Spring Data / HTTP 具体类型
- 不要在 handler 中写核心业务规则
- 禁止 application/command、application/query 目录
- **禁止为每个字段生成 getXxx() / setXxx()**，仅通过业务方法暴露行为
- **领域对象不要使用 Lombok @Data / @Getter / @Setter**，避免退化为贫血模型
- **聚合根字段使用 private**，不暴露内部集合引用

**Python**：
- router 中不要写领域规则
- 领域层不要依赖 FastAPI/SQLAlchemy 具体类型
- 使用 logging 而非 print
- 优先 uv + pyproject.toml
- **禁止为每个字段生成 @property getter/setter**，仅通过业务方法暴露行为
- **领域对象不要使用 dataclass 的自动生成 getter/setter**，避免退化为贫血模型
- **聚合根使用双下划线前缀 `__field` 保护内部状态**

**Node.js/TypeScript**：
- controller 中不要写领域规则
- 领域层不要依赖 Express/NestJS 具体类型
- 严格模式 `"strict": true`
- 使用 pino/winston 而非 console.log
- **禁止为每个字段生成 getter/setter 或直接暴露 public 字段**，仅通过业务方法暴露行为
- **领域对象避免使用 class-validator / class-transformer 装饰器污染领域模型**
- **聚合根字段使用 private / readonly**，不暴露内部集合引用

**Go**：
- handler 中不要写核心业务规则
- 领域层不导入 database/sql 具体驱动
- 使用 go modules
- **禁止为每个字段生成 GetXxx() / SetXxx() 方法**，仅通过业务方法暴露行为
- **领域结构体字段使用小写（unexported）**，不暴露内部切片/映射（防止外部直接修改）
- **不要为领域实体生成自动的 ORM tag（json/gorm）**，避免泄漏持久化关注点

**Rust**：
- handler 闭包不要堆叠领域规则
- 领域层不要依赖 axum/sqlx 具体类型
- 避免 unwrap()/expect() 处理可预期失败
- **禁止为每个字段生成 pub getter/setter**，仅通过业务方法暴露行为
- **领域结构体字段不设 pub**，不暴露内部 Vec / HashMap 的可变引用
- **不要为领域实体 derive Serialize/Deserialize**，避免泄漏序列化关注点到领域层

**C++**：
- handler 中不要写核心业务规则
- 领域层不依赖具体 HTTP 框架（drogon/pistache）或数据库驱动类型
- 使用 RAII 管理资源，避免裸指针和手动 new/delete
- 头文件使用 #pragma once 或 include guard
- 优先使用智能指针（std::unique_ptr / std::shared_ptr）
- **禁止为每个字段生成 getXxx() / setXxx() 平凡访问器**，仅通过业务方法暴露行为
- **领域类成员变量使用 private**，不暴露内部容器（避免返回 `const std::vector<T>&` 引用来绕过封装）
- **禁止为领域实体提供 JSON 序列化/反序列化**，避免泄漏持久化关注点到领域层

### 包/模块命名规范

- **Java**: UpperCamelCase 类名，lowerCamelCase 方法名，全小写包名
- **Python**: snake_case 文件名和方法名，PascalCase 类名
- **Node.js**: PascalCase 类名，camelCase 方法名，kebab-case 文件名
- **Go**: PascalCase 导出，camelCase 未导出，全小写包名
- **Rust**: snake_case 函数/模块/变量，PascalCase 类型/trait/enum
- **C++**: PascalCase 类名，snake_case 函数/变量/文件名，全小写命名空间

---

## 依赖安装规则

- \`install_dependencies\` 仅在以下情况开放：
  1. 步骤文字明确要求依赖安装
  2. 当前为 dev 任务的最后一个未完成步骤（收尾构建）
- 其余步骤只用脚手架 + 文件写入
- Code Review 可以调用构建工具做校验

---

## 输出文件

### 产品代码
\`\`\`
backend/
  ... (DDD 四层目录结构)
\`\`\`

### 集成测试
\`\`\`
integration-tests/{slug}/
  ... (集成测试工程)
\`\`\`

### 代码评审报告
\`\`\`
docs/sparrow/design/{slug}/code_review.md
\`\`\`

---

## 质量检查清单

每个任务完成后：
- [ ] 磁盘文件已生成
- [ ] 测试可以通过
- [ ] 代码符合对应语言编码规范
- [ ] DDD 四层依赖方向正确（外层依赖内层）
- [ ] 领域层不依赖框架/数据库具体类型
- [ ] **代码的属性/操作/类型与 model.md 中的定义一致**（语义相同，命名风格按语言转换）
- [ ] **领域对象不包含不必要的 getter/setter**（无 `getXxx()` / `setXxx()` 便利方法，仅暴露业务操作）
- [ ] **聚合根字段封装**（使用 private/protected 或语言等效修饰符，不直接暴露 public 字段）
- [ ] **聚合间通过 ID 引用**（不跨聚合直接持有对象引用，迪米特法则）

全部任务完成后：
- [ ] 完整构建通过
- [ ] 所有测试通过
- [ ] Code Review 完成
- [ ] plan.md 所有步骤标记为 `- [x]`
- [ ] **领域层代码与 model.md 静态模型完全对齐**（聚合、实体、值对象、领域服务）
- [ ] **非领域层代码与 model.md 动态模型完全对齐**（Command/Query、AppService、Port、Adapter）
- [ ] **API 层接口与 api.md 中定义的契约一致**
- [ ] **领域对象富含行为，非贫血模型**（业务逻辑在聚合根/实体内部，不在领域服务中集中处理本应由聚合承担的逻辑）
- [ ] **无跨聚合的链式调用**（如 `a.getB().getC().doX()`，迪米特法则）

---

## 完成后的下一步

🎉 当前限界上下文 \`{slug}\` 已全部完成！

如果有其他限界上下文需要实现，请对每个上下文执行：
**sparrow-design → sparrow-model → sparrow-plan → sparrow-apply**

全部限界上下文完成后，产品代码集中在 \`backend/\` 目录下，共享项目根命名空间，各上下文为独立模块。`;

export function register(): void {
  registerSkillTemplate('sparrow-apply', () => APPLY_BODY);
}
