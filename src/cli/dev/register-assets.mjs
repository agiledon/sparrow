import { register } from "node:module";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
register(pathToFileURL(join(dir, "asset-load-hook.js")).href, import.meta.url);
