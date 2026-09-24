/**
 * Shared adapter implementation.
 *
 * All tool adapters share identical formatting logic for skills, commands,
 * and harness references. This module holds the single shared implementation
 * and a factory that produces a `ToolCommandAdapter` from a small config,
 * so adding a new IDE requires no copied boilerplate.
 */

import type { CommandContent, ToolCommandAdapter } from './types.js';
import { formatHarnessReference } from '../harness/install.js';
import { writeSkill as writeAgentSkill, writeCommand as writeAgentCommand } from '../agent-skill/write-skill.js';

/**
 * Format a reference line to a constraint asset for a given scope.
 */
export function formatHarnessRef(harnessRelPath: string, scope: 'global' | 'project'): string {
  const path = formatHarnessReference(harnessRelPath, scope);
  return scope === 'project'
    ? `- **项目级**（优先）：\`${path}\``
    : `- **全局级**：\`${path}\``;
}

function frontmatter(lines: string[]): string {
  return ['---', ...lines, '---'].join('\n');
}

function fullFrontmatter(content: CommandContent): string {
  return frontmatter([
    `name: ${content.id}`,
    `description: ${content.description}`,
    `category: ${content.category}`,
    `tags: [${content.tags.join(', ')}]`,
  ]);
}

function formatSkillContent(content: CommandContent, interaction: string): string {
  return `${fullFrontmatter(content)}\n\n${interaction}\n\n${content.body}`;
}

function formatCommandContent(content: CommandContent, style: 'standard' | 'pi', interaction: string): string {
  const fm = style === 'pi'
    ? frontmatter([`description: ${content.description}`])
    : fullFrontmatter(content);
  const skillPath = content.skillRelPath ?? `skills/${content.id}/SKILL.md`;
  const body = [
    interaction,
    '',
    `读取并遵循 \`${skillPath}\`。`,
    '只读取该 SKILL 点名的当前步骤文件。',
    '禁止列举或批量读取同目录 `references/`、`assets/`、`steps/`。',
    '不要把附属文件全文贴进本命令或对话。',
  ];
  if (content.packageCliLines?.length) {
    body.push('', ...content.packageCliLines);
  }
  return `${fm}\n\n${body.join('\n')}\n`;
}

export interface AdapterConfig {
  /** The tool id this adapter handles */
  toolId: string;
  /** Get the file path for a skill SKILL.md */
  skillPath: (skillId: string) => string;
  /** Get the file path for a slash command, or null if the tool discovers commands from skills */
  commandPath: (skillId: string) => string | null;
  /** Command frontmatter style; 'pi' emits only `description` */
  commandStyle?: 'standard' | 'pi';
  /** Native question method for this tool, written at the top of skills and commands */
  interaction: string;
}

/**
 * Build a tool adapter from a declarative config.
 */
export function createAdapter(config: AdapterConfig): ToolCommandAdapter {
  const adapter: ToolCommandAdapter = {
    toolId: config.toolId,
    getSkillPath: config.skillPath,
    getCommandPath: config.commandPath,
    formatSkill: (content) => formatSkillContent(content, config.interaction),
    formatCommand: (content) => formatCommandContent(content, config.commandStyle ?? 'standard', config.interaction),
    formatHarnessRef,
    writeSkill: (projectRoot, pkg) => writeAgentSkill(projectRoot, adapter, pkg),
    writeCommand: (projectRoot, pkg, skillRelPath) =>
      writeAgentCommand(projectRoot, adapter, pkg, skillRelPath),
  };
  return adapter;
}
