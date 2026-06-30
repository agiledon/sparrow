/**
 * Version metadata management for generated documents.
 *
 * Provides utilities for version parsing, incrementing, and generating
 * the standard version metadata block embedded in all output documents.
 * Also provides AI-targeted instructions for version management at runtime.
 */

export interface VersionInfo {
  major: number;
  minor: number;
}

/** Current Sparrow framework version — keep in sync with package.json */
export const SPARROW_VERSION = '0.1.0';

/**
 * Parse a version string like "v1.0" or "1.0" into VersionInfo.
 */
export function parseVersion(versionStr: string): VersionInfo | null {
  const match = versionStr.trim().match(/^v?(\d+)\.(\d+)$/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
  };
}

/**
 * Increment a version string. Defaults to minor bump.
 */
export function incrementVersion(
  current: string,
  type: 'major' | 'minor' = 'minor'
): string {
  const parsed = parseVersion(current);
  if (!parsed) return 'v1.0';

  if (type === 'major') {
    return `v${parsed.major + 1}.0`;
  }
  return `v${parsed.major}.${parsed.minor + 1}`;
}

/**
 * Format version as canonical string (always with "v" prefix).
 */
export function formatVersion(version: VersionInfo): string {
  return `v${version.major}.${version.minor}`;
}

/**
 * Generate the standard version metadata block for document headers.
 * Uses HTML comment format — invisible in rendered markdown, machine-parseable.
 */
export function generateVersionBlock(version: string, skillId: string): string {
  const now = new Date().toISOString();
  return [
    '<!--',
    `  version: ${version}`,
    `  last-updated: ${now}`,
    `  generated-by: ${skillId}`,
    `  sparrow-version: ${SPARROW_VERSION}`,
    '-->',
  ].join('\n');
}

/**
 * Generate the AI-targeted instructions for version management.
 * Returned as a markdown block to be embedded in skill templates.
 */
export function getVersionManagementBlock(): string {
  return `## 📌 版本元数据管理

所有输出的文档文件**必须在文件开头**包含版本元数据块：

\`\`\`markdown
<!--
  version: v1.0
  last-updated: {ISO_8601_TIMESTAMP}
  generated-by: {SKILL_ID}
  sparrow-version: {从 .sparrow/sparrow.json 读取}
-->
\`\`\`

**版本规则**:
- **新文档**: 使用 \`v1.0\`
- **更新已有文档**: 读取现有版本号，递增次版本号（\`v1.0\` → \`v1.1\`）
- **重大重写**: 递增主版本号（\`v1.x\` → \`v2.0\`）
- 每次修改都**必须变更**版本号

**操作步骤**:
1. 检查目标文件是否已存在
2. 如果存在，读取文件开头 \`<!--\` 注释块中的 \`version:\` 字段并递增
3. 在文件开头添加或更新版本元数据块
4. 继续生成文档正文`;
}
