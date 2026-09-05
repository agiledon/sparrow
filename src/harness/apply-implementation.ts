/**
 * Apply stage constraints — code generation and encapsulation discipline.
 */

export const APPLY_IMPLEMENTATION_BODY = `# 代码实现约束（apply / implementation）

本文件定义 sparrow-apply 阶段**必须遵守 / 禁止**的代码生成纪律。

## 代码与模型一致性

1. 代码实现**必须**与 \`docs/sparrow/design/{slug}/model.md\` 中定义的领域模型严格一致（属性名、方法名、类型语义一致；命名风格按语言转换）。
2. 远程服务（Command / Query）接口必须与 \`docs/sparrow/design/{slug}/api.md\` 中的契约一致。

## DDD 四层 + 菱形对称

1. **api 层（北向网关）**：\`api/command/\`、\`api/query/\`、\`api/dto/\`
2. **application 层（北向网关）**：\`application/\`（\`*AppService\`）
3. **domain 层（领域核心）**：\`domain/aggregate/\`、\`domain/entity/\`、\`domain/valueobject/\`、\`domain/service/\`
4. **infrastructure 层（南向网关）**：\`infrastructure/port/\`（接口）、\`infrastructure/adapter/\`（实现）
5. 依赖方向：外层依赖内层，**领域层零框架依赖**（不依赖 Spring Data / FastAPI / Express / database/sql 等具体类型）。

## 跨 BC 通信（与应用架构阶段一致）

1. **同一进程**：通过下游 BC 的南向网关 Client 调用上游 BC 的北向网关本地服务。
2. **不同进程**：通过公开 API 或领域事件通信。
3. **无论是否同一进程，禁止直接跨 BC 访问领域对象**；跨 BC 调用一律经 \`api/\` 或 \`infrastructure/adapter/\`（ACL）边界。
4. 每个 BC 模块不得直接 import 另一 BC 模块的领域类型（须经其公开 API / ACL）。

## 领域 TDD

1. 领域层必须 TDD：**先写测试，再写实现**，并在同一任务步骤内完成测试 + 实现对。
2. qa 负责集成 / API / 契约测试；**禁止**领域层单元测试（领域 TDD 属于 dev）。

## 领域对象封装规则

| 规则 | 说明 | 反模式 |
|------|------|--------|
| 不生成默认 get/set | 不默认为每个属性生成访问器 | 为 \`name\`、\`age\` 等字段生成 \`getName()\` / \`setName()\` |
| 聚合根字段 private | 使用最严格的可见性修饰符 | public 字段允许外部直接赋值，绕过业务规则 |
| 聚合间 ID 引用 | 跨聚合引用时只用 ID | \`order.getCustomer().getAddress()\` |
| 值对象不可变 | 构造时初始化所有字段 | 值对象包含 setter 或 mutable 字段 |
| 业务操作为主 | 聚合根暴露体现业务意图的方法 | \`setStatus(APPROVED)\` 代替 \`approve()\` |
| 不暴露内部集合 | 不直接返回内部 List/Map 引用 | \`getItems()\` 返回内部 ArrayList 引用 |

## 语言级反模式（必须禁止）

**Java**：
- 领域层依赖 Spring Data / HTTP 具体类型
- handler 中写核心业务规则
- 禁止 \`application/command\`、\`application/query\` 目录
- 领域对象使用 Lombok \`@Data\` / \`@Getter\` / \`@Setter\`（退化为贫血模型）

**Python**：
- router 中写领域规则
- 领域层依赖 FastAPI / SQLAlchemy 具体类型
- 领域对象使用 dataclass 自动生成 getter / setter
- 使用 print 而非 logging

**Node.js / TypeScript**：
- controller 中写领域规则
- 领域层依赖 Express / NestJS 具体类型
- 领域对象用 class-validator / class-transformer 装饰器污染领域模型
- 聚合根字段非 private / readonly

**Go**：
- handler 中写核心业务规则
- 领域层导入 database/sql 具体驱动
- 领域结构体字段导出（大写），暴露内部切片 / 映射
- 为领域实体生成自动 ORM tag（json / gorm）

**Rust**：
- handler 闭包堆叠领域规则
- 领域层依赖 axum / sqlx 具体类型
- 领域结构体字段 pub
- 为领域实体 derive Serialize / Deserialize

**C++**：
- handler 中写核心业务规则
- 领域层依赖具体 HTTP 框架（drogon / pistache）或数据库驱动类型
- 领域类成员变量 public，暴露内部容器
- 为领域实体提供 JSON 序列化 / 反序列化

## 引用路径与命名空间正确性

1. 类 / 文件之间相互引用时，\`import\` / \`#include\` / \`use\` / \`mod\` 语句的路径与命名空间**必须**与实际文件位置、包 / 模块结构精确一致。
2. 相对路径层级**必须**从当前文件所在目录精确计算：先回到模块根（如 \`backend/{slug}/\`），再拼目标子路径。禁止 \`../\` 层级多一级或少一级——这是最常见的引用错误，例如把 \`../../../domain/aggregate/valve.hpp\` 误写成 \`../../domain/aggregate/valve.hpp\`。
3. 命名空间 / 包名**必须**与目标类 / 模块的实际声明一致，禁止包名、模块路径、命名空间与实际声明不符。

| 语言 | 引用正确性要求 |
|------|--------------|
| Java | \`import\` 使用目标类的全限定名（包路径 + 类名），包路径与目录结构一致，禁止错误的包名 / 类名 |
| Python | \`import\` / \`from ... import ...\` 模块路径与实际文件层级一致，禁止层级缺失 / 多余 |
| Node.js / TypeScript | \`import\` 相对路径与实际文件位置一致，禁止 \`../\` 层级错误或大小写不一致 |
| Go | \`import\` 使用模块路径（module path + 包目录），包名与目录声明一致 |
| Rust | \`use\` / \`mod\` 路径与模块树（\`crate::...\`）一致，禁止错误的模块路径 |
| C++ | \`#include\` 相对路径层级从当前文件目录精确计算，\`namespace\` 与目标声明一致，头文件使用 include guard / \`#pragma once\` |

## 数据库迁移

1. 数据库结构变更使用**版本化迁移工具**（如 Flyway / Liquibase），**禁止手写 DDL 直接执行**。
2. 若 \`tech.md\` 标明"每 BC 独立 schema"，各模块不得直接访问他模块的数据表。

## 依赖安装纪律

1. \`install_dependencies\` 仅在以下情况开放：步骤文字明确要求依赖安装，或当前为 dev 任务的最后一个未完成步骤（收尾构建）。
2. 其余步骤只用脚手架 + 文件写入。

## 通用禁止

1. api 层不写领域规则。
2. 禁止跨聚合链式调用（\`a.getB().getC().doX()\`）。
3. 领域对象必须富含行为，**禁止贫血模型**。`;
