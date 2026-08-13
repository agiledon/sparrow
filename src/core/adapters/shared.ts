/**
 * Shared adapter implementation.
 *
 * All tool adapters share identical formatting logic for skills, commands,
 * and harness references. This module holds the single shared implementation
 * and a factory that produces a `ToolCommandAdapter` from a small config,
 * so adding a new IDE requires no copied boilerplate.
 */

import type { CommandContent, ToolCommandAdapter } from './types.js';
import { formatHarnessReference } from '../harness-init.js';

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

function formatSkillContent(content: CommandContent): string {
  return `${fullFrontmatter(content)}\n\n${content.body}`;
}

function formatCommandContent(content: CommandContent, style: 'standard' | 'pi'): string {
  const fm = style === 'pi'
    ? frontmatter([`description: ${content.description}`])
    : fullFrontmatter(content);
  return `${fm}\n\n${content.body}`;
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
}

/**
 * Build a tool adapter from a declarative config.
 */
export function createAdapter(config: AdapterConfig): ToolCommandAdapter {
  return {
    toolId: config.toolId,
    getSkillPath: config.skillPath,
    getCommandPath: config.commandPath,
    formatSkill: formatSkillContent,
    formatCommand: (content) => formatCommandContent(content, config.commandStyle ?? 'standard'),
    formatHarnessRef,
  };
}
