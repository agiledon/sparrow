/**
 * project.md wizard file generation and management.
 *
 * project.md lives at docs/sparrow/project.md and serves as an index/guide
 * for the current project. It is:
 *   - Created by the CLI during `sparrow init`
 *   - Updated by AI assistants during skill execution (per template instructions)
 */

export interface ProjectMdSection {
  title: string;
  entries: { label: string; path: string; status: 'pending' | 'generated'; version?: string }[];
}

/** Canonical path to the quality-attribute document (relative to docs/sparrow/). */
export const PRD_QUALITY_PATH = 'requirement/prd-quality.md';

/**
 * Generate the initial project.md content for a new project.
 */
export function generateProjectMdContent(
  projectName: string,
  sparrowVersion: string,
  toolIds: string[]
): string {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const toolList = toolIds.join(', ');

  return `# Sparrow 项目：${projectName}

> 本文件由 Sparrow 自动生成和维护，作为项目的文档向导索引。
>
> 最后更新：${now}
> Sparrow 版本：${sparrowVersion}

---

## 项目信息

| 属性 | 值 |
|------|-----|
| 项目名称 | \`${projectName}\` |
| 创建时间 | ${now} |
| Sparrow 版本 | ${sparrowVersion} |
| 配置工具 | ${toolList} |
| 文档基路径 | \`docs/sparrow/\` |
| 代码基路径 | \`backend/\` |

---

## 文档索引

### 1. 产品需求

#### 1.1 业务需求

- [ ] [功能需求文档](./requirement/prd-business.md) — *待生成 (sparrow-explore)*

#### 1.2 质量属性

- [ ] [系统质量属性](./${PRD_QUALITY_PATH}) — *待生成 (sparrow-explore)*

#### 1.3 UI 需求（可选）

> 如果项目需要前端界面，请在执行 \`/sparrow-explore\` 时选择继续 UI 设计探索。
> 生成的 UI 规格与原型存放于 \`docs/sparrow/requirement/ui/\` 目录。

- [ ] [UI 规格](./requirement/ui/ui-spec.md) — *待生成 (sparrow-explore)*
- [ ] [设计令牌](./requirement/ui/design-tokens.md) — *待生成 (sparrow-explore)*
- [ ] [组件库](./requirement/ui/components/component-library.md) — *待生成 (sparrow-explore)*
- [ ] [主页面原型](./requirement/ui/prototypes/index.html) — *待生成 (sparrow-explore)*

### 2. 系统架构

- [ ] [业务架构](./architecture/business.md) — *待生成 (sparrow-arch)*
- [ ] [应用架构](./architecture/application.md) — *待生成 (sparrow-arch)*
- [ ] [前端架构](./architecture/frontend.md) — *待生成 (sparrow-arch)*

> 前端架构仅在项目有 UI 开发需求时提供。若无 UI 需求，该文档不会生成。

### 3. 限界上下文设计

> 每个限界上下文的设计文档将在此列出。执行 \`sparrow-arch\` 后自动添加。

---

### 4. API 目录

- [ ] [API 总目录](./api.md) — *待生成 (sparrow-design)*

> 每完成一个限界上下文的 sparrow-design 后更新此文件。

---

### 5. 产品代码

- [\`backend/\`](../backend/) — 产品代码根目录

---

## 下一步

1. 执行 **/sparrow-explore** — 从原始需求中识别业务服务（如有需要，在技能中继续 UI 设计探索）
2. 执行 **/sparrow-arch** — 划分子领域，定义业务架构、应用架构（如有 UI 则同时生成前端架构）
3. 对每个限界上下文（含交互上下文）依次执行：**design → model → plan → apply → verify**；revise 模式变更完成后执行 **archive**
`;
}
