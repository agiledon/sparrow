/**
 * Interactive terminal UI for Sparrow CLI.
 *
 * Uses @inquirer/prompts for checkbox, input, and confirm interactions.
 * Provides the welcome page rendering with ASCII art sparrow logo.
 */

import { checkbox, input, confirm } from '@inquirer/prompts';
import type { ToolDefinition } from './config.js';
import { SUPPORTED_TOOLS } from './config.js';

// ─── Color constants ────────────────────────────────────────────────

/** Dark green for sparrow logo — #2E7D32 */
const GREEN = '\x1b[38;2;46;125;50m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

// ─── Welcome Page ───────────────────────────────────────────────────

/**
 * Render the welcome page with ASCII art sparrow logo in dark green.
 * The logo features a small sparrow silhouette on the left side.
 */
export function renderWelcomePage(): void {
  const lines = [
    '',
    `${CYAN}╔══════════════════════════════════════════════════════════════╗${RESET}`,
    `${CYAN}║${RESET}                                                            ${CYAN}║${RESET}`,
    `${CYAN}║${RESET}  ${GREEN}    .  .                          _                  ${RESET}  ${CYAN}║${RESET}`,
    `${CYAN}║${RESET}  ${GREEN}   .' \\/ '.         ,-.       _//|                 ${RESET}  ${CYAN}║${RESET}`,
    `${CYAN}║${RESET}  ${GREEN}  (  .,  ,)       ,'   '.   _'/  |                 ${RESET}  ${CYAN}║${RESET}`,
    `${CYAN}║${RESET}  ${GREEN}   ) .-- (       (       ).'   ,-'                 ${RESET}  ${CYAN}║${RESET}`,
    `${CYAN}║${RESET}  ${GREEN}  /      \\       '.____.' '._.'                   ${RESET}  ${CYAN}║${RESET}`,
    `${CYAN}║${RESET}  ${GREEN} (   __   )                                          ${RESET}  ${CYAN}║${RESET}`,
    `${CYAN}║${RESET}  ${GREEN}  ',_  ,'               ${BOLD}S P A R R O W${RESET}                ${CYAN}║${RESET}`,
    `${CYAN}║${RESET}                                                            ${CYAN}║${RESET}`,
    `${CYAN}║${RESET}  ${BOLD}Spec-Driven DDD Framework for AI Coding Assistants${RESET}      ${CYAN}║${RESET}`,
    `${CYAN}║${RESET}  ${DIM}From business requirements to production code${RESET}           ${CYAN}║${RESET}`,
    `${CYAN}║${RESET}                                                            ${CYAN}║${RESET}`,
    `${CYAN}║${RESET}  ${DIM}Pipeline:${RESET} explore → arch → design → model → plan → apply   ${CYAN}║${RESET}`,
    `${CYAN}║${RESET}                                                            ${CYAN}║${RESET}`,
    `${CYAN}╚══════════════════════════════════════════════════════════════╝${RESET}`,
    '',
  ];

  for (const line of lines) {
    console.log(line);
  }
}

// ─── Prompts ────────────────────────────────────────────────────────

/**
 * Prompt user for a single-line text input.
 */
export async function promptInput(
  message: string,
  defaultValue?: string
): Promise<string> {
  return input({
    message,
    default: defaultValue,
  });
}

/**
 * Multi-select tool selection using checkbox UI.
 * Detected tools are pre-selected.
 */
export async function promptToolSelection(
  detectedTools: ToolDefinition[]
): Promise<string[]> {
  const detectedIds = new Set(detectedTools.map((t) => t.id));

  const choices = SUPPORTED_TOOLS.map((tool) => {
    const isDetected = detectedIds.has(tool.id);
    return {
      name: `${tool.name}${isDetected ? ' (detected)' : ''}`,
      value: tool.id,
      checked: isDetected,
    };
  });

  const selected = await checkbox({
    message: 'Select AI coding tools for this project:',
    choices,
    pageSize: 10,
  });

  return selected;
}

/**
 * Simple yes/no confirmation.
 */
export async function promptConfirm(
  message: string,
  defaultValue: boolean = true
): Promise<boolean> {
  return confirm({
    message,
    default: defaultValue,
  });
}

// ─── Styled Messages ────────────────────────────────────────────────

/**
 * Display a styled colored message.
 */
export function printMessage(
  type: 'success' | 'error' | 'info' | 'warning',
  text: string
): void {
  const icons: Record<string, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const colors: Record<string, string> = {
    success: GREEN,
    error: RED,
    info: CYAN,
    warning: YELLOW,
  };

  console.log(`${icons[type]} ${colors[type]}${text}${RESET}`);
}
