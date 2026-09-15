import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export async function load(url, context, nextLoad) {
  if (/\.(md|ya?ml)$/i.test(url)) {
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
