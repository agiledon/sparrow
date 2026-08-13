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
import { execSync } from 'node:child_process';
import { detectInstalledTools, executeInit, formatInitSummary, formatToolDetectionSummary } from '../core/init.js';
import { getSupportedToolIds } from '../core/config.js';
import { initializeGlobalHarness, getGlobalHarnessDir } from '../core/harness-init.js';
import { initializePluginRuntimes } from '../core/plugin-init.js';
import { renderWelcomePage, promptInput, promptToolSelection } from '../core/prompts.js';
import { isExecSyncTimeoutError } from '../core/exec-errors.js';
import { getSparrowVersion } from '../core/package-version.js';
import { compareVersions } from '../core/version-compare.js';

const program = new Command();

program
  .name('sparrow')
  .description(
    'Sparrow — spec-driven DDD framework for AI coding assistants.\n' +
    'Generate structured skills that guide AI agents through domain-driven design,\n' +
    'from business requirements to production code.'
  )
  .version(getSparrowVersion())
  .addHelpText(
    'after',
    `
Examples:
  $ sparrow init                    Initialize with detected tools
  $ sparrow init --tools claude     Set up for Claude Code only
  $ sparrow init --tools claude,opencode,cursor,pi  Set up for multiple tools
  $ sparrow init --tools all --force  Set up for all tools, no prompts
  $ sparrow update                   Check and update to the latest version
  $ sparrow --version                Show version

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
    'Comma-separated tool ids to set up (claude, opencode, cursor, pi), or "all"'
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

/**
 * Read the local Sparrow version, exiting on failure.
 */
function readLocalVersion(): string {
  try {
    return getSparrowVersion();
  } catch {
    console.error('❌ Could not read local package.json.');
    process.exit(1);
  }
}

/**
 * Query the latest Sparrow version from the npm registry, exiting on failure.
 */
function fetchLatestVersion(): string {
  try {
    const result = execSync(`npm view sparrow-ddd version`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000,
    });
    return result.trim();
  } catch (e) {
    if (isExecSyncTimeoutError(e)) {
      console.error('❌ Request to npm registry timed out (30s).');
      console.error('   Try setting a closer registry mirror:');
      console.error('   npm config set registry https://registry.npmmirror.com');
    } else {
      console.error('❌ Could not fetch latest version from npm. Check your network connection.');
    }
    process.exit(1);
  }
}

/**
 * Sync global constraint assets and plugin runtimes.
 */
function syncAssets(): void {
  const synced = initializeGlobalHarness();
  if (synced.length > 0) {
    console.log('📐 Synced ' + synced.length + ' global constraint asset(s) to ' + getGlobalHarnessDir() + '.');
  }

  const pluginSynced = initializePluginRuntimes(process.cwd());
  if (pluginSynced.length > 0) {
    console.log('🔌 Synced ' + pluginSynced.length + ' plugin runtime(s).');
  }
}

/**
 * Install the latest Sparrow version globally.
 */
function installUpdate(latestVersion: string): void {
  console.log('📦 Updating Sparrow to the latest version...');
  try {
    execSync('npm install -g sparrow-ddd@latest', {
      stdio: 'inherit',
      timeout: 60000,
    });
    console.log(`🎉 Sparrow updated to v${latestVersion} successfully.`);
    console.log(
      `📐 全局约束资产将随新版本在下次运行 \`sparrow init\` / \`sparrow update\` 时自动同步到 ${getGlobalHarnessDir()}。`
    );
  } catch {
    console.error('❌ Update failed. Try running: npm install -g sparrow-ddd@latest');
    process.exit(1);
  }
}

program
  .command('update')
  .description('Check and update Sparrow to the latest version from npm')
  .action(async () => {
    const localVersion = readLocalVersion();
    console.log(`🪶  Sparrow local version: v${localVersion}`);
    console.log('🔍 Checking latest version from npm registry...');

    const latestVersion = fetchLatestVersion();
    console.log(`🌐 Latest version on npm: v${latestVersion}`);

    syncAssets();

    if (localVersion === latestVersion) {
      console.log('✅ Your Sparrow is already up to date. No update needed.');
      process.exit(0);
    }

    if (!compareVersions(localVersion, latestVersion)) {
      console.log('✅ Local version is current. No update needed.');
      process.exit(0);
    }

    const answer = await promptInput(
      `A new version v${latestVersion} is available. Update now? (y/N):`,
      ''
    );

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('⏭️  Update skipped. You can update later with \`sparrow update\`.');
      process.exit(0);
    }

    installUpdate(latestVersion);
  });

// Default command: show help if no command given
program.action(() => {
  program.outputHelp();
});

// Parse CLI arguments
program.parse(process.argv);
