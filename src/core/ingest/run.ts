import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, isAbsolute, join, resolve } from 'node:path';
import { CHAR_BUDGET, KEYWORD_RE } from './constants.js';
import { IngestError } from './errors.js';
import { createProgress } from './progress.js';
import {
  cacheDirForHash,
  cleanupIngestCache,
  cleanAllIngest,
  ensureDir,
  ingestRoot,
  isCacheComplete,
  sha256,
  touchCache,
  writeJson,
  type SourceMeta,
} from './cache.js';
import { parseDocument, readSourceBuffer, type RawFigure } from './readers.js';
import { extractSignals } from './signals.js';
import { formatChunk, type SplitSection } from './split.js';
import { decideFigure, formatFigureMarkdown } from './figures.js';
import { buildReadPlan } from './read-plan.js';
import { extForMime } from './image-size.js';
import { defaultOcr, type OcrFn } from './ocr.js';

export interface IngestIo {
  stdout?: NodeJS.WritableStream;
  stderr?: NodeJS.WritableStream | null;
}

export interface IngestOptions extends IngestIo {
  projectRoot?: string;
  ocr?: OcrFn;
  now?: Date;
}

export interface IngestSummary {
  cache: string;
  sections: number;
  figures: number;
  readPlan: string;
  cacheHit: boolean;
}

interface OutlineSection {
  id: string;
  heading: string;
  chars: number;
  signalCount: number;
  keywordHit: boolean;
  file: string;
}

interface Outline {
  source: { path: string; hash: string; ext: string };
  sections: OutlineSection[];
  notes: string[];
}

interface FigureRecord {
  id: string;
  kept: boolean;
  reason: string;
  ocr?: 'ok' | 'empty';
  caption?: string;
  width?: number;
  height?: number;
  bytes: number;
  inHeaderFooter: boolean;
  image?: string;
  textFile?: string;
}

function emitSummary(stdout: NodeJS.WritableStream | undefined, summary: IngestSummary): void {
  if (!stdout) {
    return;
  }
  stdout.write(`${JSON.stringify({
    cache: summary.cache,
    sections: summary.sections,
    figures: summary.figures,
    readPlan: summary.readPlan,
  })}\n`);
}

function sectionId(index: number): string {
  return `s-${index}`;
}

function figureId(index: number): string {
  return `fig-${index}`;
}

function resolveSource(path: string): string {
  const abs = isAbsolute(path) ? path : resolve(process.cwd(), path);
  if (!existsSync(abs)) {
    throw new IngestError(`File not found: ${abs}`, 1);
  }
  const st = statSync(abs);
  if (!st.isFile()) {
    throw new IngestError(`Not a file: ${abs}`, 1);
  }
  return abs;
}

async function ocrFigure(
  fig: RawFigure,
  ocr: OcrFn,
): Promise<{ text: string; status: 'ok' | 'empty' }> {
  try {
    const text = (await ocr(fig.bytes, fig.mime)).trim();
    return text ? { text, status: 'ok' } : { text: '', status: 'empty' };
  } catch {
    return { text: '', status: 'empty' };
  }
}

export async function runIngest(path: string, options: IngestOptions = {}): Promise<IngestSummary> {
  const projectRoot = options.projectRoot ?? process.cwd();
  const progress = createProgress(options.stderr === null ? null : options.stderr ?? process.stderr);
  const abs = resolveSource(path);
  progress.file(abs);
  const buf = await readSourceBuffer(abs);
  const hash = sha256(buf);
  const cacheDir = cacheDirForHash(projectRoot, hash);
  const st = statSync(abs);

  if (isCacheComplete(cacheDir, hash)) {
    const outline = JSON.parse(readFileSync(join(cacheDir, 'outline.json'), 'utf8')) as Outline;
    const figuresJson = existsSync(join(cacheDir, 'figures.json'))
      ? JSON.parse(readFileSync(join(cacheDir, 'figures.json'), 'utf8')) as { figures: FigureRecord[] }
      : { figures: [] };
    const kept = (figuresJson.figures ?? []).filter((f) => f.kept).length;
    touchCache(cacheDir, options.now);
    progress.cacheHit();
    const summary: IngestSummary = {
      cache: cacheDir,
      sections: outline.sections.length,
      figures: kept,
      readPlan: join(cacheDir, 'read-plan.json'),
      cacheHit: true,
    };
    emitSummary(options.stdout ?? process.stdout, summary);
    return summary;
  }

  progress.stage('打开文件');
  cleanupIngestCache({
    projectRoot,
    currentPath: abs,
    currentHash: hash,
    exceptHash: hash,
    now: options.now,
  });

  if (existsSync(cacheDir)) {
    rmSync(cacheDir, { recursive: true, force: true });
  }

  const parsed = await parseDocument(abs, buf, progress);
  const ocr = options.ocr ?? defaultOcr;

  const toKeep: { id: string; fig: RawFigure; record: FigureRecord }[] = [];
  const figureRecords: FigureRecord[] = [];
  parsed.figures.forEach((fig, i) => {
    const id = figureId(i + 1);
    const decision = decideFigure({
      width: fig.width,
      height: fig.height,
      bytes: fig.bytes.length,
      inHeaderFooter: fig.inHeaderFooter,
      caption: fig.caption,
      alt: fig.alt,
      nearbyText: fig.nearbyText,
    });
    const record: FigureRecord = {
      id,
      kept: decision.keep,
      reason: decision.reason,
      caption: fig.caption,
      width: fig.width,
      height: fig.height,
      bytes: fig.bytes.length,
      inHeaderFooter: fig.inHeaderFooter,
    };
    if (decision.keep) {
      toKeep.push({ id, fig, record });
    }
    figureRecords.push(record);
  });

  progress.stage('OCR');
  const ocrResults: { text: string; status: 'ok' | 'empty' }[] = [];
  for (let i = 0; i < toKeep.length; i++) {
    progress.ocr(i + 1, toKeep.length);
    ocrResults.push(await ocrFigure(toKeep[i]!.fig, ocr));
  }
  progress.finishTick();

  progress.stage('写入缓存');
  ensureDir(join(cacheDir, 'chunks'));
  const signalLines: string[] = [];
  const outlineSections: OutlineSection[] = [];
  let totalChars = 0;

  parsed.sections.forEach((section: SplitSection, i) => {
    const id = sectionId(i + 1);
    const chunk = formatChunk(section);
    const signals = extractSignals(chunk);
    signalLines.push(...signals);
    const keywordHit = KEYWORD_RE.test(section.heading) || KEYWORD_RE.test(section.body);
    writeFileSync(join(cacheDir, 'chunks', `${id}.md`), chunk);
    outlineSections.push({
      id,
      heading: section.heading,
      chars: chunk.length,
      signalCount: signals.length,
      keywordHit,
      file: `chunks/${id}.md`,
    });
    totalChars += chunk.length;
  });

  const signalsText = signalLines.length > 0 ? `${signalLines.join('\n')}\n` : '';
  writeFileSync(join(cacheDir, 'signals.md'), signalsText);

  const keptIds: string[] = [];
  if (toKeep.length > 0) {
    ensureDir(join(cacheDir, 'images'));
    ensureDir(join(cacheDir, 'figures'));
  }
  toKeep.forEach((item, i) => {
    const result = ocrResults[i]!;
    const imageName = `images/${item.id}.${extForMime(item.fig.mime)}`;
    writeFileSync(join(cacheDir, imageName), item.fig.bytes);
    item.record.image = imageName;
    item.record.ocr = result.status;
    item.record.textFile = `figures/${item.id}.md`;
    const md = formatFigureMarkdown(item.id, item.fig.caption, result.text);
    writeFileSync(join(cacheDir, item.record.textFile), md);
    keptIds.push(item.id);
    totalChars += md.length;
  });

  if (parsed.notes.length > 0) {
    writeFileSync(join(cacheDir, 'notes.md'), `${parsed.notes.join('\n')}\n`);
  }

  const outline: Outline = {
    source: { path: abs, hash, ext: extname(abs).toLowerCase() },
    sections: outlineSections,
    notes: parsed.notes,
  };
  writeJson(join(cacheDir, 'outline.json'), outline);
  writeJson(join(cacheDir, 'figures.json'), { figures: figureRecords });

  const plan = buildReadPlan({
    sourcePath: abs,
    totalChars,
    sections: outlineSections,
    figureIds: keptIds,
    signalsChars: signalsText.length,
    projectRoot,
  });
  writeJson(join(cacheDir, 'read-plan.json'), plan);

  const meta: SourceMeta = {
    path: abs,
    size: st.size,
    mtimeMs: st.mtimeMs,
    hash,
    accessedAt: (options.now ?? new Date()).toISOString(),
  };
  writeJson(join(cacheDir, 'source.json'), meta);

  const keptCount = keptIds.length;
  const summary: IngestSummary = {
    cache: cacheDir,
    sections: outlineSections.length,
    figures: keptCount,
    readPlan: join(cacheDir, 'read-plan.json'),
    cacheHit: false,
  };
  progress.end(summary);
  emitSummary(options.stdout ?? process.stdout, summary);
  return summary;
}

export function showSection(
  path: string,
  section: string,
  offset = 0,
  options: IngestOptions = {},
): string {
  const projectRoot = options.projectRoot ?? process.cwd();
  const abs = resolveSource(path);
  const buf = readFileSync(abs);
  const hash = sha256(buf);
  const cacheDir = cacheDirForHash(projectRoot, hash);
  if (!isCacheComplete(cacheDir, hash)) {
    throw new IngestError(`No ingest cache for ${basename(abs)}. Run sparrow ingest first.`, 1);
  }
  const file = resolveShowFile(cacheDir, section);
  const text = readFileSync(file, 'utf8');
  const start = Math.max(0, offset);
  const window = text.slice(start, start + CHAR_BUDGET);
  const stdout = options.stdout ?? process.stdout;
  stdout.write(window);
  if (window.length > 0 && !window.endsWith('\n')) {
    stdout.write('\n');
  }
  return window;
}

function resolveShowFile(cacheDir: string, section: string): string {
  if (section === 'signals') {
    return join(cacheDir, 'signals.md');
  }
  if (/^fig-\d+$/.test(section)) {
    const p = join(cacheDir, 'figures', `${section}.md`);
    if (!existsSync(p)) {
      throw new IngestError(`Unknown figure: ${section}`, 1);
    }
    return p;
  }
  if (/^s-\d+$/.test(section)) {
    const p = join(cacheDir, 'chunks', `${section}.md`);
    if (!existsSync(p)) {
      throw new IngestError(`Unknown section: ${section}`, 1);
    }
    return p;
  }
  throw new IngestError(`Unknown section: ${section}`, 1);
}

export function runClean(options: IngestOptions = {}): void {
  const projectRoot = options.projectRoot ?? process.cwd();
  cleanAllIngest(projectRoot);
}

export { ingestRoot, cleanupIngestCache, CHAR_BUDGET };
