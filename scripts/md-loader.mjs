import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const MD = /\.md$/i;
const YAML = /\.ya?ml$/i;

export async function load(url, context, nextLoad) {
  const path = fileURLToPath(url);
  if (MD.test(path) || YAML.test(path)) {
    const source = readFileSync(path, 'utf8');
    return { format: 'module', shortCircuit: true, source: `export default ${JSON.stringify(source)};` };
  }
  return nextLoad(url, context);
}
