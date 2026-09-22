#!/usr/bin/env node
/**
 * Sparrow CLI — spec-driven DDD framework for AI coding assistants.
 *
 * Main entry point using Commander.js.
 *
 * Commands:
 *   sparrow init    Initialize Sparrow in a project
 *   sparrow ingest  Parse requirement documents into cached text and a read-plan
 *   sparrow update  Check and update to the latest version
 */

import { Command } from 'commander';
import { resolve, basename } from 'node:path';
import { executeInit } from './commands/init/run.js';
import { projectStateExists } from '../kernel/runtime/project-state.js';
import { detectInstalledTools } from './shell/tools.js';
import { formatInitSummary, formatToolDetectionSummary } from './summary.js';
import { getSupportedToolIds } from './shell/config.js';
import { renderWelcomePage, promptInput, promptToolSelection, promptConfirm } from './shell/prompts.js';
import { compareVersions } from './shell/version-compare.js';
import { initializeSkills } from '../skills/index.js';
import { readLocalVersion, fetchLatestVersion, syncAssets, installUpdate, UpdateError } from './commands/update/run.js';
import { recordCliReadiness } from './shell/cli-readiness.js';
import { SPARROW_DIR } from '../kernel/runtime/spec-paths.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { detectOsLocale, formatCommonLangs, resolveInitLang } from './shell/os-locale.js';
import { readProjectConfig } from '../kernel/runtime/project-config.js';
import { getSparrowVersion } from './shell/package-version.js';
import { SkillRegistry } from '../core/skills.js';
import { IngestError, runClean, runIngest, showSection } from './ingest/index.js';

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
  $ sparrow init --tools all          Set up for all tools
  $ sparrow init --lang zh-Hans       Document language (BCP 47). Omit to use the OS UI language
  $ sparrow init --force              Wipe specs and reset sparrow-state.json (asks for confirmation)
  $ sparrow ingest docs/prd.docx      Parse a requirement document into cached text and a read-plan
  $ sparrow ingest show docs/prd.docx --section s-1
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
  .option(
    '--lang <code>',
    'BCP 47 language for document deliverables (default: OS UI language, fallback zh-Hans)\n' +
      formatCommonLangs(),
  )
  .option('--force', 'If sparrow-state.json exists: delete all specs under docs/sparrow/master and docs/sparrow/change, then reset state (requires confirmation)')
  .action(async (options: { tools?: string; projectName?: string; force?: boolean; lang?: string }) => {
    const projectRoot = resolve(process.cwd());

    let selectedToolIds: string[];
    let projectName: string;
    let lang: string;

    const existingConfig = readProjectConfig(projectRoot);
    const detected = options.lang ? null : detectOsLocale();

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

      console.log('');
      console.log('Document language (BCP 47):');
      console.log(formatCommonLangs());
      console.log('');

      if (options.lang) {
        lang = resolveInitLang({ explicit: options.lang });
      } else if (typeof existingConfig.lang === 'string' && existingConfig.lang) {
        lang = resolveInitLang({ existing: existingConfig.lang });
        console.log(`Keeping configured language: ${lang}`);
      } else {
        const suggested = detected ?? 'zh-Hans';
        const entered = await promptInput(
          'Document language code (Enter to accept):',
          suggested,
        );
        lang = resolveInitLang({
          explicit: entered && entered !== suggested ? entered : undefined,
          detected: suggested,
        });
      }

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
      lang = resolveInitLang({
        explicit: options.lang,
        existing: existingConfig.lang,
        detected,
      });

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
      const registry = new SkillRegistry();
      initializeSkills(registry);

      let wipeSpecs = false;
      if (options.force && projectStateExists(projectRoot)) {
        console.log('');
        console.log('⚠️  DANGER: --force will DELETE all Sparrow specs:');
        console.log('   - docs/sparrow/master/');
        console.log('   - docs/sparrow/change/current/');
        console.log('   - docs/sparrow/change/archive/');
        console.log('   Then reset .sparrow/sparrow-state.json (development-mode=tbd).');
        console.log('   Project harness and generated skills are kept.');
        console.log('');
        const ok = await promptConfirm('I understand this cannot be undone. Continue?', false);
        if (!ok) {
          console.error('❌ Aborted. Specs were not deleted.');
          process.exit(1);
        }
        wipeSpecs = true;
      }

      const result = executeInit(projectRoot, {
        tools: options.tools || selectedToolIds.join(','),
        force: options.force,
        wipeSpecs,
        projectName,
        lang,
      }, registry);

      console.log(formatInitSummary(result));
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('update')
  .description('Check and update Sparrow to the latest version from npm')
  .action(async () => {
    try {
      const localVersion = readLocalVersion();
      console.log(`🪶  Sparrow local version: v${localVersion}`);
      console.log('🔍 Checking latest version from npm registry...');

      const latestVersion = fetchLatestVersion();
      console.log(`🌐 Latest version on npm: v${latestVersion}`);

      syncAssets();

      const projectRoot = resolve(process.cwd());
      if (existsSync(join(projectRoot, SPARROW_DIR))) {
        const { readiness } = recordCliReadiness(projectRoot);
        if (!readiness.ok) {
          console.log('');
          console.log(`⚠️  ${readiness.hint}`);
          console.log('   See `.sparrow/cli-readiness.json` in this project.');
        }
      }

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
    } catch (e) {
      if (e instanceof UpdateError) {
        switch (e.kind) {
          case 'read-local':
            console.error('❌ Could not read local package.json.');
            break;
          case 'timeout':
            console.error('❌ Request to npm registry timed out (30s).');
            console.error('   Try setting a closer registry mirror:');
            console.error('   npm config set registry https://registry.npmmirror.com');
            break;
          case 'fetch':
            console.error('❌ Could not fetch latest version from npm. Check your network connection.');
            break;
          case 'install':
            console.error('❌ Update failed. Try running: npm install -g sparrow-ddd@latest');
            break;
        }
        process.exit(1);
      }
      throw e;
    }
  });

function failIngest(error: unknown): never {
  if (error instanceof IngestError) {
    console.error(error.message);
    process.exit(error.exitCode);
  }
  console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function ingestProjectRoot(raw?: string): string {
  return resolve(raw ?? process.cwd());
}

const ingestProjectRootOption = {
  flags: '--project-root <dir>',
  description: 'Project root for .sparrow/ingest cache (default: cwd)',
};

const ingest = program
  .command('ingest')
  .description('Parse a requirement document into cached text and a read-plan');

ingest
  .command('show')
  .description('Write one cached section window to stdout (no progress)')
  .argument('<path>', 'Source document path')
  .requiredOption('--section <id>', 'Section id (s-N, fig-N, or signals)')
  .option('--offset <n>', 'Character offset', '0')
  .option(ingestProjectRootOption.flags, ingestProjectRootOption.description)
  .action((docPath: string, options: { section: string; offset?: string; projectRoot?: string }) => {
    try {
      const offset = Number.parseInt(options.offset ?? '0', 10);
      showSection(docPath, options.section, Number.isFinite(offset) ? offset : 0, {
        projectRoot: ingestProjectRoot(options.projectRoot),
      });
    } catch (error) {
      failIngest(error);
    }
  });

ingest
  .command('clean')
  .description('Delete the .sparrow/ingest cache directory')
  .option(ingestProjectRootOption.flags, ingestProjectRootOption.description)
  .action((options: { projectRoot?: string }) => {
    try {
      runClean({ projectRoot: ingestProjectRoot(options.projectRoot) });
    } catch (error) {
      failIngest(error);
    }
  });

ingest
  .argument('<path>', 'Document path (.md, .markdown, .doc, .docx, .pdf)')
  .option(ingestProjectRootOption.flags, ingestProjectRootOption.description)
  .action(async (docPath: string, options: { projectRoot?: string }) => {
    try {
      await runIngest(docPath, { projectRoot: ingestProjectRoot(options.projectRoot) });
    } catch (error) {
      failIngest(error);
    }
  });

// Default command: show help if no command given
program.action(() => {
  program.outputHelp();
});

// Parse CLI arguments
program.parse(process.argv);
