import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export async function load(url, context, nextLoad) {
  const isBundledScript = /templates\/(skills|shared)\/.+\.mjs$/i.test(url);
  if (/\.(md|ya?ml|html)$/i.test(url) || isBundledScript) {
    const path = fileURLToPath(url);
    const source = readFileSync(path, "utf8");
    return {
      format: "module",
      shortCircuit: true,
      source: `export default ${JSON.stringify(source)};\n`,
    };
  }
  return nextLoad(url, context);
}
