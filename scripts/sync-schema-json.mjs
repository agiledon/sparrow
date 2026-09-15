import { readFileSync, writeFileSync } from "node:fs";
import yaml from "js-yaml";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "schemas", "sparrow-ddd");
const data = yaml.load(readFileSync(join(dir, "schema.yaml"), "utf8"));
writeFileSync(join(dir, "schema.json"), JSON.stringify(data, null, 2) + "\n");
console.log("synced schema.json");
