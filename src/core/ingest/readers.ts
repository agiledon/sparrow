import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import mammoth from 'mammoth';
import WordExtractor from 'word-extractor';
import { extractImages, getDocumentProxy } from 'unpdf';
import { IngestError } from './errors.js';
import { encodePng } from './png.js';
import { mimeFromName, readImageSize } from './image-size.js';
import { unzip } from './zip.js';
import { CAPTION_RE } from './constants.js';
import type { IngestProgress } from './progress.js';
import { splitMarkdown, splitPlainText, type SplitSection } from './split.js';

export interface RawFigure {
  bytes: Buffer;
  mime: string;
  caption: string;
  alt: string;
  nearbyText: string;
  inHeaderFooter: boolean;
  width?: number;
  height?: number;
}

export interface ParseResult {
  sections: SplitSection[];
  figures: RawFigure[];
  notes: string[];
}

function captionFromAttrs(name: string, descr: string, nearby: string): string {
  return descr.trim() || name.trim() || nearby.trim();
}

function nearbyCaption(text: string): string {
  const hit = text.split(/\r?\n/).find((line) => CAPTION_RE.test(line));
  return hit?.trim() ?? '';
}

export async function parseDocument(
  absPath: string,
  buf: Buffer,
  progress: IngestProgress,
): Promise<ParseResult> {
  const ext = extname(absPath).toLowerCase();
  if (ext === '.md' || ext === '.markdown') {
    progress.stage('抽出文本');
    progress.stage('切节');
    return {
      sections: splitMarkdown(buf.toString('utf8')),
      figures: [],
      notes: [],
    };
  }
  if (ext === '.docx') {
    return parseDocx(buf, progress);
  }
  if (ext === '.doc') {
    return parseDoc(buf, progress);
  }
  if (ext === '.pdf') {
    return parsePdf(buf, progress);
  }
  throw new IngestError(`Unsupported file type: ${ext || '(none)'}`, 1);
}

async function parseDocx(buf: Buffer, progress: IngestProgress): Promise<ParseResult> {
  progress.stage('抽出文本');
  const convertToMarkdown = (
    mammoth as typeof mammoth & {
      convertToMarkdown: typeof mammoth.convertToHtml;
    }
  ).convertToMarkdown;
  const converted = await convertToMarkdown(
    { buffer: buf },
    {
      convertImage: mammoth.images.imgElement(async () => ({ src: '', alt: '' })),
    },
  );
  const markdown = converted.value.replace(/!\[.*?\]\([^)]*\)/g, '').trim();
  progress.stage('切节');
  const sections = splitMarkdown(markdown);
  progress.stage('抽图');
  const figures = extractDocxFigures(buf, markdown);
  progress.finishTick();
  return { sections, figures, notes: [] };
}

function extractDocxFigures(buf: Buffer, nearbyText: string): RawFigure[] {
  const files = unzip(buf);
  const rels = files.get('word/_rels/document.xml.rels')?.toString('utf8') ?? '';
  const relMap = new Map<string, string>();
  for (const m of rels.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
    const target = m[2]!;
    const resolved = target.startsWith('/')
      ? target.slice(1)
      : `word/${target.replace(/^\.\//, '')}`;
    relMap.set(m[1]!, resolved);
  }
  const headerFooterPaths = new Set<string>();
  for (const [name, xml] of files) {
    if (!/word\/_rels\/(header|footer)[^/]*\.rels$/i.test(name)) {
      continue;
    }
    for (const m of xml.toString('utf8').matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
      const target = m[2]!;
      const resolved = target.startsWith('/')
        ? target.slice(1)
        : `word/${target.replace(/^\.\//, '')}`;
      headerFooterPaths.add(resolved);
    }
  }
  const captions = new Map<string, { name: string; descr: string }>();
  const documentXml = files.get('word/document.xml')?.toString('utf8') ?? '';
  const embedPattern =
    /<wp:docPr\b([^>]*)>[\s\S]*?<a:blip\b[^>]*r:embed="([^"]+)"/g;
  for (const m of documentXml.matchAll(embedPattern)) {
    const attrs = m[1] ?? '';
    const id = m[2]!;
    const name = attrs.match(/\bname="([^"]*)"/)?.[1] ?? '';
    const descr = attrs.match(/\bdescr="([^"]*)"/)?.[1] ?? '';
    captions.set(id, { name, descr });
  }
  const figures: RawFigure[] = [];
  const mediaNames = [...files.keys()].filter((n) => n.startsWith('word/media/'));
  for (const mediaName of mediaNames) {
    const bytes = files.get(mediaName);
    if (!bytes) {
      continue;
    }
    const relId = [...relMap.entries()].find(([, path]) => path === mediaName || path.endsWith(mediaName.split('/').pop()!))?.[0];
    const cap = relId ? captions.get(relId) : undefined;
    const size = readImageSize(bytes);
    figures.push({
      bytes,
      mime: mimeFromName(mediaName),
      caption: captionFromAttrs(cap?.name ?? '', cap?.descr ?? '', ''),
      alt: cap?.descr ?? cap?.name ?? '',
      nearbyText,
      inHeaderFooter: headerFooterPaths.has(mediaName),
      width: size?.width,
      height: size?.height,
    });
  }
  return figures;
}

async function parseDoc(buf: Buffer, progress: IngestProgress): Promise<ParseResult> {
  progress.stage('抽出文本');
  const extractor = new WordExtractor();
  const doc = await extractor.extract(buf);
  const text = doc.getBody();
  progress.stage('切节');
  const sections = splitPlainText(text);
  progress.stage('抽图');
  progress.finishTick();
  return {
    sections,
    figures: [],
    notes: ['.doc 无法抽取嵌入图'],
  };
}

function sectionsFromPdfPages(pages: string[]): SplitSection[] {
  const out: SplitSection[] = [];
  pages.forEach((text, i) => {
    const pageLabel = `## 第${i + 1}页`;
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    const inner =
      /^#{1,6}\s+\S/m.test(trimmed) ? splitMarkdown(trimmed) : splitPlainText(trimmed);
    if (inner.length === 1 && !inner[0]!.heading) {
      out.push({ heading: pageLabel, body: inner[0]!.body });
      return;
    }
    for (const sec of inner) {
      out.push({
        heading: sec.heading || pageLabel,
        body: sec.body,
      });
    }
  });
  return out.length > 0 ? out : [{ heading: '', body: pages.join('\n') }];
}

async function parsePdf(buf: Buffer, progress: IngestProgress): Promise<ParseResult> {
  progress.stage('抽出文本');
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    progress.pages(i, pdf.numPages);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => {
        if (!item || typeof item !== 'object' || !('str' in item)) {
          return '';
        }
        const row = item as { str: string; hasEOL?: boolean };
        return row.str + (row.hasEOL ? '\n' : '');
      })
      .join('');
    pages.push(text);
  }
  progress.finishTick();
  const joined = pages.join('\n').trim();
  if (!joined) {
    throw new IngestError('PDF has no text layer', 2);
  }
  progress.stage('切节');
  const sections = sectionsFromPdfPages(pages);
  progress.stage('抽图');
  const figures: RawFigure[] = [];
  let imageIndex = 0;
  let totalGuess = 0;
  for (let i = 1; i <= pdf.numPages; i++) {
    const images = await extractImages(pdf, i);
    totalGuess += images.length;
    for (const img of images) {
      imageIndex += 1;
      progress.figures(imageIndex, Math.max(totalGuess, imageIndex));
      const bytes = encodePng(img.width, img.height, Buffer.from(img.data), img.channels);
      const pageText = pages[i - 1] ?? '';
      figures.push({
        bytes,
        mime: 'image/png',
        caption: nearbyCaption(pageText),
        alt: '',
        nearbyText: pageText,
        inHeaderFooter: false,
        width: img.width,
        height: img.height,
      });
    }
  }
  progress.finishTick();
  return { sections, figures, notes: [] };
}

export async function readSourceBuffer(absPath: string): Promise<Buffer> {
  return readFile(absPath);
}
