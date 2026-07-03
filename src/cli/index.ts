#!/usr/bin/env node
/**
 * Sparrow CLI — spec-driven DDD framework for AI coding assistants.
 *
 * Main entry point using Commander.js.
 *
 * Commands:
 *   sparrow init    Initialize Sparrow in a project
 */

import { Command } from 'commander';
import { resolve, basename } from 'node:path';
import { detectInstalledTools, executeInit, formatInitSummary, formatToolDetectionSummary } from '../core/init.js';
import { getSupportedToolIds } from '../core/config.js';
import { renderWelcomePage, promptInput, promptToolSelection } from '../core/prompts.js';

const program = new Command();

program
  .name('sparrow')
  .description(
    'Sparrow — spec-driven DDD framework for AI coding assistants.\n' +
    'Generate structured skills that guide AI agents through domain-driven design,\n' +
    'from business requirements to production code.'
  )
  .version('0.1.1')
  .addHelpText(
    'after',
    `
Examples:
  $ sparrow init                    Initialize with detected tools
  $ sparrow init --tools claude     Set up for Claude Code only
  $ sparrow init --tools claude,opencode,cursor  Set up for multiple tools
  $ sparrow init --tools all --force  Set up for all tools, no prompts
  $ sparrow --version               Show version

Supported tools: ${getSupportedToolIds().join(', ')}
`
  );

/**
 * Sanitize a directory name into a valid kebab-case project name.
 */
function sanitizeProjectName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'my-project';
}

program
  .command('init')
  .description('Initialize Sparrow in the current project')
  .option(
    '--tools <ids>',
    'Comma-separated tool ids to set up (claude, opencode, cursor), or "all"'
  )
  .option('--project-name <name>', 'Project name in English (used for code directory)')
  .option('--force', 'Skip confirmation prompts')
  .action(async (options: { tools?: string; projectName?: string; force?: boolean }) => {
    const projectRoot = resolve(process.cwd());

    let selectedToolIds: string[];
    let projectName: string;

    // ── Interactive mode: no --tools flag ──────────────────────────
    if (!options.tools) {
      renderWelcomePage();

      // 1. Collect project name
      const defaultName = sanitizeProjectName(basename(projectRoot));
      projectName = options.projectName || await promptInput(
        'Enter project name (English, kebab-case):',
        defaultName
      );
      if (!projectName) {
        projectName = defaultName;
      }
      projectName = sanitizeProjectName(projectName);

      // 2. Show tool detection and let user select
      const detectedTools = detectInstalledTools(projectRoot);
      console.log(formatToolDetectionSummary(detectedTools));
      console.log('');

      const chosenTools = await promptToolSelection(detectedTools);
      if (chosenTools.length === 0) {
        console.error('❌ No tools selected. Exiting.');
        process.exit(1);
      }
      selectedToolIds = chosenTools;

      console.log('');
    } else {
      // ── Non-interactive mode: --tools provided ───────────────────
      projectName = options.projectName || sanitizeProjectName(basename(projectRoot));

      const detectedTools = detectInstalledTools(projectRoot);
      console.log('');
      console.log('🪶  Sparrow — Spec-Driven DDD Framework');
      console.log('');
      console.log(formatToolDetectionSummary(detectedTools));
      console.log('');

      // parseToolSelection is called inside executeInit
      selectedToolIds = []; // placeholder — executeInit will resolve from options.tools
    }

    try {
      const result = executeInit(projectRoot, {
        tools: options.tools || selectedToolIds.join(','),
        force: options.force,
        projectName,
      });

      console.log(formatInitSummary(result));
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Default command: show help if no command given
program.action(() => {
  program.outputHelp();
});

// Parse CLI arguments
program.parse(process.argv);
