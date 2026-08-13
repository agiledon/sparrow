import * as archify from './bundled/archify/index.js';
import * as sparrowUi from './bundled/sparrow-ui/index.js';
import { registerBundledPlugin } from './registry.js';

const bundledPlugins = [archify, sparrowUi];

export function loadBundledPlugins(): void {
  for (const plugin of bundledPlugins) {
    registerBundledPlugin({
      manifest: plugin.manifest,
      skillContent: plugin.skillContent,
      augmentContents: { 'SKILL.md': plugin.skillContent },
    });
  }
}
