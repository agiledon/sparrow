import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { ToolCommandAdapter, CommandContent } from '../adapters/types.js';
import type { AgentSkillPackage } from '../../kernel/skill/types.js';
import { HARNESS_TOKEN } from '../../kernel/skill/HarnessToken.js';
import { buildHarnessSection } from './harness-section.js';
import { injectAugmentPlugins } from './plugin-augment.js';

function writeBundleFile(absPath: string, content: string): void {
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, content.endsWith('\n') ? content : `${content}\n`, 'utf-8');
}

function fillHarnessPlaceholder(
  body: string,
  adapter: ToolCommandAdapter,
  harnessRelPaths: string[],
): string {
  const harnessSection = buildHarnessSection(adapter, harnessRelPaths);
  if (body.includes(HARNESS_TOKEN)) {
    return body.replace(HARNESS_TOKEN, harnessSection);
  }
  if (harnessSection) {
    return `${body}\n${harnessSection}`;
  }
  return body;
}

/**
 * Write one Agent skill tree (SKILL.md + optional bundled files) for a tool adapter.
 */
export function writeSkill(
  projectRoot: string,
  adapter: ToolCommandAdapter,
  pkg: AgentSkillPackage,
): { skillRelPath: string; createdRelPaths: string[] } {
  const bundle = pkg.generate();
  let body = fillHarnessPlaceholder(
    bundle.skillMarkdown,
    adapter,
    bundle.metadata.harnessRelPaths,
  );
  body = injectAugmentPlugins(body, pkg.workflowId);

  const content: CommandContent = {
    id: bundle.metadata.id,
    name: bundle.metadata.name,
    description: bundle.metadata.description,
    category: bundle.metadata.category,
    tags: bundle.metadata.tags,
    body,
    ...(bundle.metadata.packageCliLines
      ? { packageCliLines: bundle.metadata.packageCliLines }
      : {}),
  };

  const skillRelPath = adapter.getSkillPath(pkg.workflowId);
  content.skillRelPath = skillRelPath;
  const skillPath = join(projectRoot, skillRelPath);
  mkdirSync(dirname(skillPath), { recursive: true });
  writeFileSync(skillPath, adapter.formatSkill(content), 'utf-8');

  const skillDir = dirname(skillRelPath);
  const createdRelPaths: string[] = [skillRelPath];

  for (const file of bundle.references ?? []) {
    const rel = join(skillDir, file.relativePath);
    writeBundleFile(join(projectRoot, rel), file.content);
    createdRelPaths.push(rel);
  }
  for (const file of bundle.assets ?? []) {
    const rel = join(skillDir, file.relativePath);
    writeBundleFile(join(projectRoot, rel), file.content);
    createdRelPaths.push(rel);
  }
  for (const file of bundle.scripts ?? []) {
    const rel = join(skillDir, file.relativePath);
    writeBundleFile(join(projectRoot, rel), file.content);
    createdRelPaths.push(rel);
  }
  for (const file of bundle.steps ?? []) {
    const rel = join(skillDir, file.relativePath);
    writeBundleFile(join(projectRoot, rel), file.content);
    createdRelPaths.push(rel);
  }

  return { skillRelPath, createdRelPaths };
}

export function writeCommand(
  projectRoot: string,
  adapter: ToolCommandAdapter,
  pkg: AgentSkillPackage,
  skillRelPath: string,
): string | null {
  const commandRelPath = adapter.getCommandPath(pkg.workflowId);
  if (commandRelPath === null) {
    return null;
  }
  const bundle = pkg.generate();
  const content: CommandContent = {
    id: bundle.metadata.id,
    name: bundle.metadata.name,
    description: bundle.metadata.description,
    category: bundle.metadata.category,
    tags: bundle.metadata.tags,
    body: '',
    skillRelPath,
    ...(bundle.metadata.packageCliLines
      ? { packageCliLines: bundle.metadata.packageCliLines }
      : {}),
  };
  const commandPath = join(projectRoot, commandRelPath);
  mkdirSync(dirname(commandPath), { recursive: true });
  writeFileSync(commandPath, adapter.formatCommand(content), 'utf-8');
  return commandRelPath;
}
