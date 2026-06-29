/**
 * Sparrow Apply skill template.
 * Adapted from sparrow-ddd/.sparrow/rules/07-apply-design-plan.mdc
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

## 角色定义

你驱动三个角色按 plan.md 执行任务：

1. **Development Engineer** (\`dev\`)：产品代码（DDD 四层 + 领域 TDD）
2. **QA Engineer** (\`qa\`)：集成测试、API/契约测试
3. **Code Review**：代码评审，生成 code_review.md

---

## 必读规约

- \`docs/sparrow/design/{slug}/plan.md\` — 执行计划（以 plan 为准的执行顺序）
- \`docs/sparrow/design/{slug}/spec.md\` — 场景与验收
- \`docs/sparrow/design/{slug}/api.md\` — 对外契约
- \`docs/sparrow/design/{slug}/tech.md\` — 技术栈与工具链
- \`docs/sparrow/design/{slug}/model.md\` — 领域模型

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
- 产品代码写入 \`code/{slug}/\` 模块
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

### 语言特定反模式

**Java**：
- 领域层不要依赖 Spring Data / HTTP 具体类型
- 不要在 handler 中写核心业务规则
- 禁止 application/command、application/query 目录

**Python**：
- router 中不要写领域规则
- 领域层不要依赖 FastAPI/SQLAlchemy 具体类型
- 使用 logging 而非 print
- 优先 uv + pyproject.toml

**Node.js/TypeScript**：
- controller 中不要写领域规则
- 领域层不要依赖 Express/NestJS 具体类型
- 严格模式 \`"strict": true\`
- 使用 pino/winston 而非 console.log

**Go**：
- handler 中不要写核心业务规则
- 领域层不导入 database/sql 具体驱动
- 使用 go modules

**Rust**：
- handler 闭包不要堆叠领域规则
- 领域层不要依赖 axum/sqlx 具体类型
- 避免 unwrap()/expect() 处理可预期失败

### 包/模块命名规范

- **Java**: UpperCamelCase 类名，lowerCamelCase 方法名，全小写包名
- **Python**: snake_case 文件名和方法名，PascalCase 类名
- **Node.js**: PascalCase 类名，camelCase 方法名，kebab-case 文件名
- **Go**: PascalCase 导出，camelCase 未导出，全小写包名
- **Rust**: snake_case 函数/模块/变量，PascalCase 类型/trait/enum

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
code/{slug}/
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

全部任务完成后：
- [ ] 完整构建通过
- [ ] 所有测试通过
- [ ] Code Review 完成
- [ ] plan.md 所有步骤标记为 \`- [x]\`

---

## 完成后的下一步

🎉 当前限界上下文 \`{slug}\` 已全部完成！

如果有其他限界上下文需要实现，请对每个上下文执行：
**sparrow-design → sparrow-model → sparrow-plan → sparrow-apply**

全部限界上下文完成后，产品代码集中在 \`code/\` 目录下，共享项目根命名空间，各上下文为独立模块。
`;

export function register(): void {
  registerSkillTemplate('sparrow-apply', () => APPLY_BODY);
}
