/**
 * Sparrow Design skill template.
 * Adapted from sparrow-ddd/.sparrow/rules/04-define-service-contracts.mdc
 *
 * This skill generates API contracts (api.md) and technology stack selection (tech.md)
 * for a specific bounded context.
 */

import { registerSkillTemplate } from '../core/skill-generation.js';

const DESIGN_BODY = `# Sparrow Design — API 契约与技术选型

## 执行顺序检查

在执行之前，请检查当前阶段是否合适：

\`\`\`
当前步骤：sparrow-design（第 3 步 / 共 6 步）
所属层级：团队级（team-level），针对特定限界上下文
前置条件：
  1. docs/sparrow/architecture/application.md 必须存在
  2. docs/sparrow/design/{slug}/spec.md 必须存在
下一步骤：sparrow-model @{slug}（团队级）
\`\`\`

**前置条件检查**：
- 如果 \`docs/sparrow/architecture/application.md\` 不存在，请提示用户先执行 **sparrow-arch**
- 如果 \`docs/sparrow/design/{slug}/spec.md\` 不存在，请提示用户先执行 **sparrow-arch**（它会创建各限界上下文的 spec 切片）
- 如果用户未指定限界上下文，请列出可用的限界上下文让用户选择

---

## 角色定义

你是一名**应用系统架构师与技术负责人**，负责为当前限界上下文生成：
1. **服务契约文档（api.md）**：包含序列图和 API 定义
2. **技术选型文档（tech.md）**：技术栈选择与实现约束

## 输入文档要求

### 必需文档
1. **业务服务列表文档**：\`docs/sparrow/design/{slug}/spec.md\`（当前限界上下文的切片需求）
2. **应用架构定义文档**：\`docs/sparrow/architecture/application.md\`
3. **架构图中的技术实现建议**（来自 application.md 中对当前上下文的描述）

## 技术选型交互流程

在执行 sparrow-design 时，你需要引导用户进行以下选择：

### 第一步：选择后端实现语言
请用户从以下选项中选择：
1. **Java** (Spring Boot 3.x + Maven)
2. **Node.js** (TypeScript + Express/NestJS)
3. **Python** (FastAPI/Django + uv)
4. **Go** (标准库 net/http 或 chi)
5. **Rust** (Axum + SQLx)

### 第二步：选择具体技术栈方案
根据用户选择的语言，提供该语言下的若干套备选技术栈（包含框架、数据库、消息队列、缓存等），让用户选择。

### 第三步：写入 tech.md
将用户选定的方案写入 \`docs/sparrow/design/{slug}/tech.md\`

## tech.md 结构

写入 **\`docs/sparrow/design/{slug}/tech.md\`**：

\`\`\`markdown
# 技术选型 — {限界上下文中文名} ({english-slug})

## 1. 概述与选型结论
- **选定方案**: {方案标题}
- **结论摘要**: {为什么该方案适配本上下文}

## 2. 与应用架构的对应关系
- **技术实现建议（摘录）**: {来自 application.md}
- **对策**: {选型如何落实上述建议}

## 3. 选定技术栈详述
| 层次 | 选型 | 说明 |
|------|------|------|
| 运行时 / 语言 | | |
| 应用框架 | | |
| API 层 | | |
| 主要依赖 | | |

## 4. API 与集成
- **对外契约**: 对齐 api.md
- **认证与授权**:
- **第三方与上游上下文**:

## 5. 数据与持久化
- **存储**:
- **事务与一致性**:
- **缓存（若适用）**:

## 6. 横切能力
- **可观测性**:
- **配置**:
- **安全**:

## 7. 构建、测试与部署
- **构建**:
- **测试**:
- **部署/运行**:
- **模块边界**: code/{slug}/ 单模块，DDD 四层为包/目录划分

## 8. 风险与待决事项
\`\`\`

---

## 服务契约生成步骤

### 步骤1: 分析业务服务分配
1. 从当前限界上下文的 spec.md 中提取业务服务列表
2. 确定服务契约的调用方式 (HTTP/Event)

### 步骤2: 分析上下文映射关系
1. 从 application.md 中识别当前上下文与其他上下文的关系
2. 确定调用模式 (Customer/Supplier, ACL, OHS 等)
3. 设计跨上下文的消息交互

### 步骤3: 绘制序列图
1. 确定参与者（限界上下文级别，不涉及内部实现）
2. 设计消息交互流程
3. 添加业务逻辑注释
4. 处理异常流程

### 步骤4: 定义 API
1. 确定 HTTP 方法和资源路径
2. 设计请求/响应模型
3. 定义错误处理

## 序列图绘制规则

### 参与者定义
- 只包含限界上下文作为整体参与者
- 不包含限界上下文内部的消息交互
- 外部系统作为独立参与者

### 消息交互类型
1. **HTTP RESTful 调用**: 使用 \`->>\` 表示同步调用
2. **事件发布/订阅**: 使用 \`->>\` 和 \`-->>\` 表示异步事件

### 序列图模板
\`\`\`mermaid
sequenceDiagram
    participant 外部系统 as External System
    participant 上游上下文 as Upstream Context
    participant 下游上下文 as Downstream Context

    外部系统->>上游上下文: 发起请求
    上游上下文->>下游上下文: 调用服务
    Note right of 下游上下文: 业务处理逻辑
    下游上下文-->>上游上下文: 返回结果
    上游上下文-->>外部系统: 响应结果
\`\`\`

## API 定义规则

### RESTful 设计原则
- 使用 HTTP 动词表示操作类型
- 使用名词表示资源
- 使用复数形式命名资源
- 使用嵌套 URL 表示资源关系

### API 模板
\`\`\`yaml
- API名称: 服务名称
- API定义: operationName(RequestType): ResponseType
- Swagger协议: HTTP_METHOD /api/v1/resource

#### Request Format
{ "field1": "type", "field2": "type" }

#### Response Format
{ "status": "success|error", "data": {}, "message": "Optional message" }
\`\`\`

## api.md 结构

写入 **\`docs/sparrow/design/{slug}/api.md\`**：

\`\`\`markdown
# 服务契约 — {限界上下文中文名}

## 1. 限界上下文概述
## 2. 服务契约列表
## 3. 服务契约详细定义

### 3.1 {服务名称}
#### 序列图
[Mermaid 序列图]

#### API 定义
- **API名称**:
- **API定义**:
- **Swagger协议**:

#### Request Format
#### Response Format
\`\`\`

## 质量检查清单

- [ ] 每个限界上下文都有对应的 api.md 和 tech.md
- [ ] 序列图只包含限界上下文级别的交互
- [ ] API 定义遵循 RESTful 设计原则
- [ ] 请求/响应模型完整
- [ ] 错误处理机制完善
- [ ] 事件驱动的服务契约有明确的事件定义
- [ ] 跨上下文调用关系清晰
- [ ] tech.md 包含所有 8 个必要章节

## 完成后的下一步

✅ 完成 sparrow-design @{slug} 后，请执行 **sparrow-model @{slug}**（团队级）—— 为当前限界上下文进行领域建模。
`;

export function register(): void {
  registerSkillTemplate('sparrow-design', () => DESIGN_BODY);
}
