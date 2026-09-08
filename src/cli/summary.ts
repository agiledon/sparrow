/**
 * CLI summary formatting (presentation layer).
 *
 * Renders user-facing init output. Lives in cli/ so core stays free of
 * presentation concerns.
 */

import { SUPPORTED_TOOLS, type ToolDefinition } from '../core/tools.js';
import type { InitResult } from '../core/init.js';

/**
 * Generate a summary table of detected tools for display.
 */
export function formatToolDetectionSummary(detectedTools: ToolDefinition[]): string {
  if (detectedTools.length === 0) {
    return 'No AI coding tools detected in this project.';
  }

  const lines = ['Detected AI coding tools:'];
  for (const tool of detectedTools) {
    lines.push(`  ✅ ${tool.name} (${tool.id})`);
  }

  const undetected = SUPPORTED_TOOLS.filter(
    (t) => !detectedTools.some((d) => d.id === t.id)
  );
  if (undetected.length > 0) {
    lines.push('');
    lines.push('Not detected (can still be selected with --tools):');
    for (const tool of undetected) {
      lines.push(`  ⬜ ${tool.name} (${tool.id})`);
    }
  }

  return lines.join('\n');
}

/**
 * Format the init result as a user-friendly summary.
 */
export function formatInitSummary(result: InitResult): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('✨ Sparrow initialized successfully!');
  lines.push('');
  lines.push(`📦 Project: ${result.projectName}`);
  lines.push(`📋 Tools configured: ${result.tools.join(', ')}`);
  lines.push(`📄 Config: .sparrow/sparrow.json`);
  lines.push(`📑 Guide: ${result.projectMdPath}`);
  lines.push(`📁 Backend dir: backend/`);
  lines.push('');
  lines.push(`📐 Constraint assets (harness):`);
  lines.push(`   Global (${result.globalHarnessFiles.length}): ~/.config/sparrow/harness/`);
  lines.push(`   Project (${result.projectHarnessFiles.length}): docs/sparrow/harness/`);
  lines.push('');
  if (result.pluginRuntimeFiles.length > 0) {
    const cached = result.pluginRuntimeFiles.filter(f => f.includes('(cached)'));
    const installed = result.pluginRuntimeFiles.filter(f => !f.includes('(cached)'));
    const parts: string[] = [];
    if (cached.length > 0) parts.push(cached.length + ' cached');
    if (installed.length > 0) parts.push(installed.length + ' installed');
    lines.push(`🔌 Plugin runtimes (${parts.join(', ')}): ~/.config/sparrow/plugins/`);
    lines.push('');
  }

  for (const { toolId, files } of result.createdFiles) {
    lines.push(`🔧 ${toolId}:`);
    // Extract skill names from skill file paths (skills/{name}/SKILL.md)
    const skillFiles = files.filter((f) => f.includes('/skills/'));
    const skillNames = new Set(
      skillFiles.map((f) => {
        const parts = f.split('/');
        const skillsIdx = parts.indexOf('skills');
        return skillsIdx >= 0 ? parts[skillsIdx + 1] : null;
      }).filter(Boolean)
    );
    lines.push(`   Skills (${skillNames.size}): ${Array.from(skillNames).sort().join(', ')}`);
    lines.push(`   Files: ${files.length} generated`);
  }

  lines.push('');
  lines.push('🚀 Next steps:');
  lines.push('   1. Start with /sparrow-explore to identify business services');
  lines.push('   2. Run /sparrow-arch to define architecture');
  lines.push('   3. For each bounded context: /sparrow-design → /sparrow-model → /sparrow-plan → /sparrow-apply');
  lines.push('');
  lines.push('   Supporting: /sparrow-supporting-harness | /sparrow-supporting-reconcile | /sparrow-supporting-archive');
  lines.push('');
  lines.push('   Full pipeline: explore → arch → design → model → plan → apply');

  return lines.join('\n');
}
