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

### 1. 业务需求

- [ ] [业务服务定义](./requirement/spec.md) — *待生成 (sparrow-explore)*

### 2. 业务架构

- [ ] [业务架构](./architecture/business.md) — *待生成 (sparrow-arch)*
- [ ] [应用架构](./architecture/application.md) — *待生成 (sparrow-arch)*

### 3. 限界上下文设计

> 每个限界上下文的设计文档将在此列出。执行 \`sparrow-arch\` 后自动添加。

---

### 4. 产品代码

- [\`backend/\`](../backend/) — 产品代码根目录

---

## 下一步

1. 执行 **/sparrow-explore** — 从原始需求中识别业务服务
2. 执行 **/sparrow-arch** — 划分子领域，定义业务架构和应用架构
3. 对每个限界上下文依次执行：**design → model → plan → apply**
`;
}

/**
 * Get the path for project.md relative to the output base.
 */
export function getProjectMdPath(outputBase: string): string {
  return `${outputBase}/project.md`;
}

/**
 * Generate AI-targeted instructions for updating project.md after a skill completes.
 * The skillId determines which document entries should be updated.
 */
export function getProjectMdUpdateBlock(skillId: string): string {
  const skillDocMap: Record<string, string> = {
    'sparrow-explore': 'requirement/spec.md',
    'sparrow-arch': 'architecture/business.md 和 architecture/application.md',
    'sparrow-design': 'design/{slug}/api.md 和 design/{slug}/tech.md',
    'sparrow-model': 'design/{slug}/model.md',
    'sparrow-plan': 'design/{slug}/plan.md',
  };

  const docPaths = skillDocMap[skillId] || '对应的文档';

  return `## 📋 project.md 更新

完成输出后，**必须**更新 \`docs/sparrow/project.md\`：

1. 如果 \`project.md\` 不存在，根据当前项目信息创建它
2. 在"文档索引"部分，更新对应的文档链接（${docPaths}）
3. 将对应条目的状态从 \`_待生成_\` 更新为 \`_v{version}_\`（使用实际版本号）
4. 如果是新创建的限界上下文设计文档，在"限界上下文设计"部分添加新的子章节：
   \`\`\`markdown
   #### {限界上下文名称} (\`{slug}\`)
   - [spec](./design/{slug}/spec.md) — *v1.0*
   - [api](./design/{slug}/api.md) — *待生成*
   - [tech](./design/{slug}/tech.md) — *待生成*
   - [model](./design/{slug}/model.md) — *待生成*
   - [plan](./design/{slug}/plan.md) — *待生成*
   \`\`\`
5. 更新文件头部的"最后更新"时间戳

**project.md 路径**: \`docs/sparrow/project.md\``;
}
