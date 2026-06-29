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
import { resolve } from 'node:path';
import { detectInstalledTools, executeInit, formatInitSummary, formatToolDetectionSummary } from '../core/init.js';
import { getSupportedToolIds } from '../core/config.js';

const program = new Command();

program
  .name('sparrow')
  .description(
    'Sparrow — spec-driven DDD framework for AI coding assistants.\n' +
    'Generate structured skills that guide AI agents through domain-driven design,\n' +
    'from business requirements to production code.'
  )
  .version('0.1.0')
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

program
  .command('init')
  .description('Initialize Sparrow in the current project')
  .option(
    '--tools <ids>',
    'Comma-separated tool ids to set up (claude, opencode, cursor), or "all"'
  )
  .option('--force', 'Skip confirmation prompts')
  .action(async (options: { tools?: string; force?: boolean }) => {
    const projectRoot = resolve(process.cwd());

    console.log('');
    console.log('🪶  Sparrow — Spec-Driven DDD Framework');
    console.log('');

    // Show detection summary
    const detectedTools = detectInstalledTools(projectRoot);
    console.log(formatToolDetectionSummary(detectedTools));
    console.log('');

    try {
      const result = executeInit(projectRoot, {
        tools: options.tools,
        force: options.force,
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
