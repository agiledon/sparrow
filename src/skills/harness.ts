/**
 * Sparrow Harness skill template.
 *
 * Auxiliary command for viewing and maintaining constraint assets (harness).
 * Independent of the DDD pipeline stages; can be invoked at any time.
 */

import { registerSkillTemplate } from '../core/skill-generation.js';

const HARNESS_BODY = `# Sparrow Harness — 约束资产管理

## 用途

这是一个**辅助命令**，与 DDD 流水线阶段（explore → arch → design → model → plan → apply）**无关，可随时调用**。它用于：

1. **查看**当前项目的约束资产索引
2. **添加**用户提供的新约束（自动分类到对应阶段文件）
3. **更新 / 删除**项目级约束资产
4. 明确全局级与项目级的优先级关系

## 约束资产结构

| 位置 | 路径 | 说明 |
|------|------|------|
| 全局级 | \`~/.config/sparrow/harness/\`（全局配置目录） | DDD 通用纪律，由 Sparrow 维护 |
| 项目级 | \`docs/sparrow/harness/\` | 本项目特有约束，**优先级最高** |

**优先级**：项目级 > 全局级。内容冲突时以项目级为准；项目级文件不存在时使用全局级约束。

## 执行流程

1. 读取 \`docs/sparrow/harness/constitution.md\`，理解约束资产索引结构。
2. 根据用户请求执行相应操作：
   - **查看**：输出约束资产索引，列出项目级与全局级文件
   - **添加约束**：将用户提供的新约束按阶段分类，写入对应的项目级文件
   - **更新约束**：修改已有的项目级约束
   - **删除约束**：移除不再适用的项目级约束
3. 若用户未明确指定阶段，由你**自动分类**（根据约束内容判断属于哪个阶段），无需用户选择。

## 约束分类规则

| 约束内容类型 | 目标文件 |
|-------------|---------|
| 业务服务识别 / 需求文档 / Grill Me 提问 | explore/requirements.md |
| 子领域划分 / 业务架构 | arch/business.md |
| 限界上下文 / BC 通信 / 上下文映射 / 自治原则 | arch/application.md |
| API 契约 / 序列图 / 组件图 | design/api-design.md |
| DDD 四层 / 角色构造型 / 调用规则 / PO 纪律 | model/architecture.md |
| 聚合边界 / OOP 原则 / 静态动态建模 | model/domain-modeling.md |
| 代码生成 / 封装 / 语言反模式 / 跨 BC 通信 | apply/implementation.md |
| 跨阶段通用纪律 | constitution.md |

## 格式要求

- 每个约束以 **Must / Must Not** 形式编写（"必须…" / "禁止…"）。
- 同一分类下按"必须 / 禁止 / 判断标准"分组组织。
- 项目级约束覆盖全局约束的说明保留在 \`constitution.md\` 中。
- 写入后，若新增了阶段文件或调整了索引，同步更新 \`docs/sparrow/harness/constitution.md\`。

## 完成后的效果

- 新增 / 修改的约束对**后续**执行的阶段命令即时生效。
- 各阶段 skill 会自动加载项目级 + 全局级约束（项目级优先）。`;

export function register(): void {
  registerSkillTemplate('sparrow-harness', () => HARNESS_BODY);
}
