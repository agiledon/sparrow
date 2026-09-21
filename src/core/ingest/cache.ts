import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { CACHE_MAX_AGE_MS, CACHE_MAX_BYTES, HASH_PREFIX_LEN, INGEST_DIR } from './constants.js';

export interface SourceMeta {
  path: string;
  size: number;
  mtimeMs: number;
  hash: string;
  accessedAt: string;
}

export function ingestRoot(projectRoot: string): string {
  return join(projectRoot, INGEST_DIR);
}

export function cacheDirForHash(projectRoot: string, hash: string): string {
  return join(ingestRoot(projectRoot), hash.slice(0, HASH_PREFIX_LEN));
}

export function sha256(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

export function readSourceMeta(dir: string): SourceMeta | null {
  const file = join(dir, 'source.json');
  if (!existsSync(file)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as SourceMeta;
  } catch {
    return null;
  }
}

export function isCacheComplete(dir: string, expectedHash: string): boolean {
  const meta = readSourceMeta(dir);
  if (!meta || meta.hash !== expectedHash) {
    return false;
  }
  return existsSync(join(dir, 'read-plan.json')) && existsSync(join(dir, 'outline.json'));
}

export function touchCache(dir: string, now = new Date()): void {
  const meta = readSourceMeta(dir);
  if (!meta) {
    return;
  }
  meta.accessedAt = now.toISOString();
  writeFileSync(join(dir, 'source.json'), `${JSON.stringify(meta, null, 2)}\n`);
  const ts = now.getTime() / 1000;
  try {
    utimesSync(dir, ts, ts);
  } catch {
    // ignore
  }
}

function dirSize(dir: string): number {
  let total = 0;
  if (!existsSync(dir)) {
    return 0;
  }
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += dirSize(p);
    } else {
      total += statSync(p).size;
    }
  }
  return total;
}

function lastAccessMs(dir: string, meta: SourceMeta | null): number {
  if (meta?.accessedAt) {
    const parsed = Date.parse(meta.accessedAt);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  try {
    const st = statSync(dir);
    return Math.max(st.atimeMs, st.mtimeMs);
  } catch {
    return 0;
  }
}

export interface CleanupOptions {
  projectRoot: string;
  currentPath?: string;
  currentHash?: string;
  exceptHash?: string;
  now?: Date;
  maxAgeMs?: number;
  maxBytes?: number;
}

export function cleanupIngestCache(opts: CleanupOptions): void {
  const root = ingestRoot(opts.projectRoot);
  if (!existsSync(root)) {
    return;
  }
  const except = (opts.exceptHash ?? opts.currentHash)?.slice(0, HASH_PREFIX_LEN);
  const now = opts.now ?? new Date();
  const maxAge = opts.maxAgeMs ?? CACHE_MAX_AGE_MS;
  const maxBytes = opts.maxBytes ?? CACHE_MAX_BYTES;

  const dirs = readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(root, e.name));

  for (const dir of dirs) {
    const hash12 = dir.split(/[/\\]/).pop() ?? '';
    if (except && hash12 === except) {
      continue;
    }
    const meta = readSourceMeta(dir);
    let remove = false;
    if (!meta) {
      remove = true;
    } else if (opts.currentPath && meta.path === opts.currentPath && meta.hash !== opts.currentHash) {
      remove = true;
    } else if (meta.path && !existsSync(meta.path)) {
      remove = true;
    } else if (now.getTime() - lastAccessMs(dir, meta) > maxAge) {
      remove = true;
    }
    if (remove) {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  const remaining = readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(root, e.name))
    .filter((dir) => {
      const hash12 = dir.split(/[/\\]/).pop() ?? '';
      return !(except && hash12 === except);
    })
    .map((dir) => ({
      dir,
      access: lastAccessMs(dir, readSourceMeta(dir)),
      size: dirSize(dir),
    }))
    .sort((a, b) => a.access - b.access);

  let total =
    remaining.reduce((sum, d) => sum + d.size, 0) +
    (except && existsSync(join(root, except)) ? dirSize(join(root, except)) : 0);
  for (const item of remaining) {
    if (total <= maxBytes) {
      break;
    }
    rmSync(item.dir, { recursive: true, force: true });
    total -= item.size;
  }
}

export function cleanAllIngest(projectRoot: string, exceptHash?: string): void {
  const root = ingestRoot(projectRoot);
  if (!existsSync(root)) {
    return;
  }
  const except = exceptHash?.slice(0, HASH_PREFIX_LEN);
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const dir = join(root, entry.name);
    if (except && entry.name === except) {
      continue;
    }
    rmSync(dir, { recursive: true, force: true });
  }
}

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

export function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
