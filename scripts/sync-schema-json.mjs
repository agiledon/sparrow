import { readFileSync, writeFileSync } from "node:fs";
import yaml from "js-yaml";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemaYaml = join(root, "src", "content", "schema", "schema.yaml");
const legacyDir = join(root, "src", "schemas");
const data = yaml.load(readFileSync(schemaYaml, "utf8"));
const json = JSON.stringify(data, null, 2) + "\n";
writeFileSync(join(root, "src", "content", "schema", "schema.json"), json);
writeFileSync(join(legacyDir, "schema.json"), json);
console.log("synced schema.json (content/schema + src/schemas)");
