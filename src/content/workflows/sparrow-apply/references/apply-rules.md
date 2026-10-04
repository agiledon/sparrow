## 变更模式（revise）— 只改影响范围里的代码

入口与对账格式见 `references/revise-gate.md`。本阶段不是自动重跑。只处理 `delta.md` **最新一节**影响范围里点名的 slug。未点名的 `backend/{slug}/` 不读、不改。

已有代码指 `backend/{slug}/` 存在。没有该目录时，按 plan 正向生成，不做迁移。

没有 `plan.md` 时先 **sparrow-plan**。不得在本阶段新起尚未经过子领域判断和一对一映射的 slug。

### 代码动作

- **分给已有限界上下文，且还没有代码**：本阶段不生成代码。规格停在已经写到的那一层。
- **分给已有限界上下文，且已有代码**：先有规格。契约和模型仍兼容时，在原模块上扩展。被破坏时走绞杀者或防腐层；用户确认切换前，公开 API 保持可调用。确认后再退役旧路径。
- **新增限界上下文，且还没有代码**：规格已经按正向流程写到 plan 之后，才按 plan 新建 `backend/{slug}/`。不复制其它模块的代码。
- **删除限界上下文，且还没有代码**：不删模块。规格已在确认后移入该 change 的 `retired/`。
- **删除限界上下文，且已有代码**：没有接收方时不删模块，先走绞杀者。已有接收方并得到用户确认后，并入接收方，留下垫片；再次确认切换后，才删除 `backend/{slug}/`。
- **合并 A+B→C**：目标新 slug 必须已经完成子领域判断和一对一映射。有代码的参与者按上面的「已有代码」处理；没有代码的只改规格。cutover 须用户确认。
- **移动聚合（X 从 A→B）**：A 或 B 已有代码时，才搬迁 `domain/aggregate|entity|valueobject/` 与 `infrastructure/port|adapter/`。跨限界上下文调用经 ACL 保持外部契约稳定。没有代码则只改规格。
- **防腐层**：仅新增 `infrastructure/adapter/acl/`，不改本地领域模型。
- **绞杀者**：旧模块保留，新路径并行，经 facade 或特性开关路由。并存期双写或事件桥接。cutover 须用户确认，之后才退役旧模块。
- **数据迁移**：若 `tech.md` 标明每限界上下文独立 schema，合并或拆分才跨模块迁表。并存期双写或 CDC，cutover 后再停旧表。

### 架构边界回归校验（fitness function）

每次代码迁移后，执行轻量边界校验，确保新模块边界未退化（呼应演进式架构「恰当耦合」支柱）：
1. 每个限界上下文模块只 import 自身 \`domain/\`、\`application/\`、\`api/\`、\`infrastructure/\` 内部类型；不得直接 import 另一限界上下文模块的领域类型（须经其公开 API / ACL）。
2. 若 \`tech.md\` 声明「每限界上下文独立 schema」，各模块不得直接访问他模块的数据表。
3. 跨限界上下文调用一律经 \`api/\` 或 \`infrastructure/adapter/\`（ACL）边界。
4. 公开 API 契约（来自 \`api.md\`）在迁移前后保持一致（除非本次变更显式修改）。

校验不通过则停下并报告，不得带病推进。

### 收尾
- 变更后重跑 **Code Review**，生成或更新 `design/{slug}/code_review.md`。
- change 工作区不写 `<!-- version -->`。代码侧的 Delta 写入 `delta.md`，不在 `project.md` 展开。
- 影响范围里点名的 slug 都处理完后，提示用户执行 **sparrow-verify**，通过后再 **sparrow-archive**。

---

## 必读规约

- \`docs/sparrow/change/current/{activeChangeId}/design/{slug}/plan.md\` — 执行计划（以 plan 为准的执行顺序）
- \`docs/sparrow/change/current/{activeChangeId}/design/{slug}/spec.md\` — 场景（Scenario）与验收
- \`docs/sparrow/change/current/{activeChangeId}/design/{slug}/api.md\` — 对外契约
- \`docs/sparrow/change/current/{activeChangeId}/design/{slug}/tech.md\` — 技术栈与工具链
- \`docs/sparrow/change/current/{activeChangeId}/design/{slug}/model.md\` — 领域模型（静态 + 动态）

---

## 代码与模型一致性（核心约束）

代码实现**必须**与 \`docs/sparrow/change/current/{activeChangeId}/design/{slug}/model.md\` 中定义的领域模型保持严格一致。

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

> **关键**：命名风格可以不同，但**语义必须一致**。例如 model.md 中的 \`placeOrder()\` 在 Python 中应写为 \`place_order()\`，在 Go 中应写为 \`PlaceOrder()\`。

### 领域对象封装规则

> 📐 封装纪律的完整表格见约束资产 \`apply/implementation.md\`。核心规则：
> - **不生成默认 get/set**：不默认为每个属性生成访问器
> - **聚合根字段 private**：使用最严格的可见性修饰符
> - **聚合间 ID 引用**：跨聚合引用时只用 ID，不直接持有对象引用
> - **值对象不可变**：构造时初始化所有字段，无修改方法
> - **业务操作为主**：聚合根暴露体现业务意图的方法（\`approve()\` 而非 \`setStatus(APPROVED)\`）
> - **不暴露内部集合**：不直接返回聚合内的 List/Map 引用

---

## 跨限界上下文通信（与限界上下文纪律一致）

> 📐 跨限界上下文通信纪律与 arch 阶段（\`arch/bounded-contexts.md\`）完全一致：
> - **同一进程**：通过下游限界上下文的南向网关 Client 调用上游限界上下文的北向网关本地服务
> - **不同进程**：通过公开 API 或领域事件通信
> - **无论是否同一进程，禁止直接跨限界上下文访问领域对象**；跨限界上下文调用一律经 \`api/\` 或 \`infrastructure/adapter/\`（ACL）边界
> - 每个限界上下文模块不得直接 import 另一限界上下文模块的领域类型

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
- 运行检查并生成 \`docs/sparrow/change/current/{activeChangeId}/design/{slug}/code_review.md\`
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

根据 tech.md 中选定的语言，遵循对应的编码规范。

### 通用规则

- 所有语言：遵循 DDD 四层目录结构
- 领域层不依赖框架/数据库具体类型
- api 层不写领域规则
- infrastructure 层 port 为接口，adapter 为实现
- **领域对象必须富含行为**（反贫血模型），禁止不必要的 getter/setter，封装内部状态，聚合间 ID 引用（信息专家、迪米特法则）

### 语言特定反模式

> 📐 各语言的完整反模式清单见约束资产 \`apply/implementation.md\`（必须禁止），要点包括：
> - **Java**：禁止 Lombok @Data/@Getter/@Setter、禁止 \`application/command\`、\`application/query\` 目录
> - **Python**：禁止 dataclass 自动生成 getter/setter，使用 logging 而非 print
> - **Node.js/TypeScript**：禁止 class-validator / class-transformer 装饰器污染领域模型，聚合根字段 private/readonly
> - **Go**：领域结构体字段小写（unexported），禁止自动 ORM tag（json/gorm）
> - **Rust**：领域结构体字段不设 pub，禁止 derive Serialize/Deserialize
> - **C++**：领域类成员 private，禁止为领域实体提供 JSON 序列化/反序列化

### 包/模块命名规范

- **Java**: UpperCamelCase 类名，lowerCamelCase 方法名，全小写包名
- **Python**: snake_case 文件名和方法名，PascalCase 类名
- **Node.js**: PascalCase 类名，camelCase 方法名，kebab-case 文件名
- **Go**: PascalCase 导出，camelCase 未导出，全小写包名
- **Rust**: snake_case 函数/模块/变量，PascalCase 类型/trait/enum
- **C++**: PascalCase 类名，snake_case 函数/变量/文件名，全小写命名空间

### 引用路径与命名空间正确性

> 📐 完整约束见 \`apply/implementation.md\`「引用路径与命名空间正确性」。核心要求：
> - \`import\` / \`#include\` / \`use\` / \`mod\` 路径与实际文件位置、包 / 模块结构精确一致
> - 相对路径 \`../\` 层级从当前文件目录精确计算，禁止多一级或少一级
> - 命名空间 / 包名与目标类 / 模块的实际声明一致

---

## 依赖安装规则

- \`install_dependencies\` 仅在以下情况开放：
  1. 步骤文字明确要求依赖安装
  2. 当前为 dev 任务的最后一个未完成步骤（收尾构建）
- 其余步骤只用脚手架 + 文件写入
- Code Review 可以调用构建工具做校验

---

