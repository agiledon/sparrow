#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const contentDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const schemaYaml = join(contentDir, 'schema', 'schema.yaml');
const data = yaml.load(readFileSync(schemaYaml, 'utf8'));
const json = JSON.stringify(data, null, 2) + '\n';
writeFileSync(join(contentDir, 'schema', 'schema.json'), json);
console.log('synced schema.json (content/schema)');
