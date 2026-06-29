/**
 * Command Adapter Registry.
 *
 * Static registry that pre-registers all tool adapters at module load time.
 * Provides fail-fast errors and O(1) lookups via Map.
 */

import type { ToolCommandAdapter } from './types.js';
import { claudeAdapter } from './claude.js';
import { opencodeAdapter } from './opencode.js';
import { cursorAdapter } from './cursor.js';

const _registry = new Map<string, ToolCommandAdapter>();

// Pre-register all adapters at module load time
const _adapters: ToolCommandAdapter[] = [
  claudeAdapter,
  opencodeAdapter,
  cursorAdapter,
];

for (const adapter of _adapters) {
  if (_registry.has(adapter.toolId)) {
    throw new Error(`Duplicate tool id registered: ${adapter.toolId}`);
  }
  _registry.set(adapter.toolId, adapter);
}

/**
 * Get the adapter for a specific tool id.
 * Throws if the tool id is not registered.
 */
export function getAdapter(toolId: string): ToolCommandAdapter {
  const adapter = _registry.get(toolId);
  if (!adapter) {
    const supported = Array.from(_registry.keys()).join(', ');
    throw new Error(
      `No adapter registered for tool '${toolId}'. Supported tools: ${supported}`
    );
  }
  return adapter;
}

/**
 * Get all registered adapter tool ids.
 */
export function getRegisteredToolIds(): string[] {
  return Array.from(_registry.keys());
}

/**
 * Check if a tool id has a registered adapter.
 */
export function hasAdapter(toolId: string): boolean {
  return _registry.has(toolId);
}

export { claudeAdapter, opencodeAdapter, cursorAdapter };
