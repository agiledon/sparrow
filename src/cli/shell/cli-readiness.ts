import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { SPARROW_DIR } from '../../kernel/runtime/spec-paths.js';

export const CLI_READINESS_REL = `${SPARROW_DIR}/cli-readiness.json`;

export interface SparrowCliReadiness {
  checkedAt: string;
  ok: boolean;
  version?: string;
  method?: 'path' | 'npx' | 'local-bin';
  hint: string;
}

type SpawnFn = typeof spawnSync;

function parseVersion(stdout: string): string | undefined {
  const line = stdout.trim().split('\n')[0]?.trim();
  return line && line.length > 0 ? line : undefined;
}

function tryCommand(spawn: SpawnFn, cmd: string, args: string[]): { ok: boolean; version?: string } {
  const result = spawn(cmd, args, { encoding: 'utf8' });
  if (result.status === 0 && result.stdout) {
    return { ok: true, version: parseVersion(result.stdout) };
  }
  return { ok: false };
}

export function probeSparrowCli(projectRoot: string, spawn: SpawnFn = spawnSync): SparrowCliReadiness {
  const checkedAt = new Date().toISOString();

  const onPath = tryCommand(spawn, 'sparrow', ['--version']);
  if (onPath.ok) {
    return {
      checkedAt,
      ok: true,
      version: onPath.version,
      method: 'path',
      hint: 'Sparrow CLI on PATH is ready for `sparrow ingest` at project root.',
    };
  }

  const localBin = join(projectRoot, 'node_modules', '.bin', 'sparrow');
  if (existsSync(localBin)) {
    const local = tryCommand(spawn, localBin, ['--version']);
    if (local.ok) {
      return {
        checkedAt,
        ok: true,
        version: local.version,
        method: 'local-bin',
        hint: 'CLI via node_modules/.bin/sparrow — invoke from project root.',
      };
    }
  }

  const viaNpx = tryCommand(spawn, 'npx', ['sparrow-ddd', '--version']);
  if (viaNpx.ok) {
    return {
      checkedAt,
      ok: true,
      version: viaNpx.version,
      method: 'npx',
      hint: 'CLI reachable via `npx sparrow-ddd` (first run may need network).',
    };
  }

  return {
    checkedAt,
    ok: false,
    hint:
      'Sparrow CLI not detected. Install globally (`npm install -g sparrow-ddd`), `npm link` in a checkout, or add `sparrow-ddd` to this project. Requirement stage needs `sparrow ingest` — see `.sparrow/cli-readiness.json` after init.',
  };
}

export function writeCliReadiness(projectRoot: string, readiness: SparrowCliReadiness): string {
  mkdirSync(join(projectRoot, SPARROW_DIR), { recursive: true });
  const abs = join(projectRoot, CLI_READINESS_REL);
  writeFileSync(abs, `${JSON.stringify(readiness, null, 2)}\n`, 'utf8');
  return abs;
}

export function recordCliReadiness(
  projectRoot: string,
  spawn: SpawnFn = spawnSync,
): { path: string; readiness: SparrowCliReadiness } {
  const readiness = probeSparrowCli(projectRoot, spawn);
  const path = writeCliReadiness(projectRoot, readiness);
  return { path, readiness };
}
