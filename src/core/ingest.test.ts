import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Writable } from 'node:stream';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReadPlan,
  decideFigure,
  extractSignals,
  IngestError,
  noisyPng,
  runIngest,
  showSection,
  splitMarkdown,
  zipStore,
} from './ingest/index.js';
import { DIAGRAM_RE, KEYWORD_RE } from './ingest/constants.js';
import { encodePng } from './ingest/png.js';

function capture() {
  let text = '';
  const stream = new Writable({
    write(chunk, _enc, cb) {
      text += String(chunk);
      cb();
    },
  });
  return {
    stream,
    get text() {
      return text;
    },
  };
}

function tmpProject(): string {
  return mkdtempSync(join(tmpdir(), 'sparrow-ingest-'));
}

function escapePdf(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdf(pageTexts: string[]): Buffer {
  const n = pageTexts.length;
  const pageObjs: number[] = [];
  const contentObjs: number[] = [];
  let next = 3;
  for (let i = 0; i < n; i++) {
    pageObjs.push(next);
    next += 1;
    contentObjs.push(next);
    next += 1;
  }
  const font = next;
  const obj: Record<number, string> = {
    1: '<< /Type /Catalog /Pages 2 0 R >>',
    2: `<< /Type /Pages /Kids [${pageObjs.map((p) => `${p} 0 R`).join(' ')}] /Count ${n} >>`,
    [font]: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  };
  for (let i = 0; i < n; i++) {
    const stream = `BT /F1 12 Tf 72 720 Td (${escapePdf(pageTexts[i] ?? '')}) Tj ET`;
    obj[contentObjs[i]!] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    obj[pageObjs[i]!] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentObjs[i]} 0 R /Resources << /Font << /F1 ${font} 0 R >> >> >>`;
  }
  let body = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (let i = 1; i <= font; i++) {
    offsets[i] = Buffer.byteLength(body, 'latin1');
    body += `${i} 0 obj\n${obj[i]}\nendobj\n`;
  }
  const xrefPos = Buffer.byteLength(body, 'latin1');
  let xref = `xref\n0 ${font + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= font; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  body += xref;
  body += `trailer\n<< /Size ${font + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(body, 'latin1');
}

function emptyPdf(): Buffer {
  return buildPdfWithContent('BT ET');
}

function buildPdfWithContent(contentStream: string): Buffer {
  const obj: Record<number, string> = {
    1: '<< /Type /Catalog /Pages 2 0 R >>',
    2: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    3: '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    4: `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`,
    5: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  };
  let body = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (let i = 1; i <= 5; i++) {
    offsets[i] = Buffer.byteLength(body, 'latin1');
    body += `${i} 0 obj\n${obj[i]}\nendobj\n`;
  }
  const xrefPos = Buffer.byteLength(body, 'latin1');
  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  body += xref;
  body += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(body, 'latin1');
}

function tinyPng(): Buffer {
  const pixels = new Uint8Array(16 * 16 * 3);
  return encodePng(16, 16, pixels, 3);
}

function makeDocx(opts: {
  heading?: string;
  body: string;
  images?: { name: string; bytes: Buffer; caption?: string; header?: boolean }[];
}): Buffer {
  const images = opts.images ?? [];
  const files: Record<string, Buffer | string> = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  ${images.some((i) => i.header) ? '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>' : ''}
</Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  };

  const bodyImages = images.filter((i) => !i.header);
  const headerImages = images.filter((i) => i.header);
  const drawings: string[] = [];
  const rels: string[] = [];
  bodyImages.forEach((img, i) => {
    const rid = `rIdImg${i + 1}`;
    files[`word/media/${img.name}`] = img.bytes;
    rels.push(
      `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${img.name}"/>`,
    );
    const caption = img.caption ?? '';
    drawings.push(`<w:p><w:r><w:drawing><wp:inline>
      <wp:extent cx="2000000" cy="2000000"/>
      <wp:docPr id="${i + 1}" name="${caption}" descr="${caption}"/>
      <a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
        <pic:pic><pic:blipFill><a:blip r:embed="${rid}"/></pic:blipFill></pic:pic>
      </a:graphicData></a:graphic>
    </wp:inline></w:drawing></w:r></w:p>`);
  });
  if (headerImages.length > 0) {
    rels.push(
      '<Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>',
    );
    const headerRels: string[] = [];
    const headerDrawings: string[] = [];
    headerImages.forEach((img, i) => {
      const rid = `rIdH${i + 1}`;
      files[`word/media/${img.name}`] = img.bytes;
      headerRels.push(
        `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${img.name}"/>`,
      );
      headerDrawings.push(`<w:p><w:r><w:drawing><wp:inline>
        <wp:docPr id="${i + 1}" name="logo" descr="logo"/>
        <a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
          <pic:pic><pic:blipFill><a:blip r:embed="${rid}"/></pic:blipFill></pic:pic>
        </a:graphicData></a:graphic>
      </wp:inline></w:drawing></w:r></w:p>`);
    });
    files['word/header1.xml'] =
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">${headerDrawings.join('')}</w:hdr>`;
    files['word/_rels/header1.xml.rels'] =
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${headerRels.join('')}</Relationships>`;
  }

  const headingXml = opts.heading
    ? `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>${opts.heading}</w:t></w:r></w:p>`
    : '';
  files['word/document.xml'] =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>${headingXml}<w:p><w:r><w:t>${opts.body}</w:t></w:r></w:p>${drawings.join('')}</w:body>
</w:document>`;
  files['word/_rels/document.xml.rels'] =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels.join('')}</Relationships>`;
  return zipStore(files);
}

const stubOcr = async (): Promise<string> => 'OCR_TEXT';

test('splitMarkdown cuts on ATX headings', () => {
  const sections = splitMarkdown('# A\nhello\n## B\nworld');
  assert.equal(sections.length, 2);
  assert.equal(sections[0]?.heading, '# A');
  assert.equal(sections[0]?.body, 'hello');
  assert.equal(sections[1]?.heading, '## B');
});

test('extractSignals keeps 必须 and must sentences verbatim', () => {
  assert.deepEqual(extractSignals('前言\n系统必须完成登录。\n其他'), ['系统必须完成登录。']);
  assert.deepEqual(extractSignals('Intro\nThe system must complete login.\nOther'), [
    'The system must complete login.',
  ]);
  assert.deepEqual(extractSignals('Guards\nUsers shall not skip MFA.\nOther'), [
    'Users shall not skip MFA.',
  ]);
});

test('keyword and diagram matchers accept Chinese and English', () => {
  assert.equal(KEYWORD_RE.test('功能需求'), true);
  assert.equal(KEYWORD_RE.test('Functional Requirements'), true);
  assert.equal(KEYWORD_RE.test('User scenarios'), true);
  assert.equal(KEYWORD_RE.test('附录说明'), false);
  assert.equal(DIAGRAM_RE.test('时序图'), true);
  assert.equal(DIAGRAM_RE.test('Sequence diagram'), true);
  assert.equal(DIAGRAM_RE.test('architecture context'), true);
});

test('decideFigure drops small icons and keeps flowchart captions', () => {
  assert.equal(
    decideFigure({
      width: 16,
      height: 16,
      bytes: 100,
      inHeaderFooter: false,
      caption: '流程图',
      alt: '',
      nearbyText: '',
    }).keep,
    false,
  );
  const kept = decideFigure({
    width: 120,
    height: 120,
    bytes: 9000,
    inHeaderFooter: false,
    caption: '流程图',
    alt: '',
    nearbyText: '',
  });
  assert.equal(kept.keep, true);
  assert.equal(kept.reason, 'caption');
  const keptEn = decideFigure({
    width: 120,
    height: 120,
    bytes: 9000,
    inHeaderFooter: false,
    caption: 'Sequence diagram',
    alt: '',
    nearbyText: '',
  });
  assert.equal(keptEn.keep, true);
  assert.equal(keptEn.reason, 'caption');
});

test('ingest markdown: sections, signals, stdout has no body', async () => {
  const root = tmpProject();
  const src = join(root, 'prd.md');
  const body = '系统必须完成登录。';
  writeFileSync(src, `# 规则\n\n${body}\n`);
  const stdout = capture();
  const stderr = capture();
  const summary = await runIngest(src, {
    projectRoot: root,
    stdout: stdout.stream,
    stderr: stderr.stream,
    ocr: stubOcr,
  });
  const out = stdout.text;
  const err = stderr.text;
  assert.equal(out.split('\n').filter(Boolean).length, 1);
  assert.equal(out.includes(body), false);
  assert.match(err, /prd\.md/);
  assert.match(err, /打开文件|抽出文本|切节|写入缓存/);
  const signals = readFileSync(join(summary.cache, 'signals.md'), 'utf8');
  assert.match(signals, /系统必须完成登录。/);
  const shown = capture();
  showSection(src, 's-1', 0, { projectRoot: root, stdout: shown.stream, stderr: null });
  assert.match(shown.text, /必须完成登录/);
});

test('over-budget read-plan uses signals and keyword sections with offsets', () => {
  const sections = [
    { id: 's-1', chars: 20000, signalCount: 0, keywordHit: false },
    { id: 's-2', chars: 100, signalCount: 2, keywordHit: true },
    { id: 's-3', chars: 25000, signalCount: 0, keywordHit: true },
  ];
  const plan = buildReadPlan({
    sourcePath: '/tmp/prd.md',
    totalChars: 45100,
    sections,
    figureIds: ['fig-1'],
    signalsChars: 80,
  });
  const ids = plan.items.map((i) => `${i.kind}:${i.id}:${i.offset}`);
  assert.ok(ids.some((id) => id.startsWith('signals:signals:')));
  assert.ok(ids.includes('chunk:s-3:0'));
  assert.ok(ids.includes('chunk:s-3:24000'));
  assert.equal(ids.some((id) => id.startsWith('chunk:s-1:')), false);
  assert.equal(ids.some((id) => id.startsWith('chunk:s-2:')), false);
  assert.ok(ids.includes('figure:fig-1:0'));
});

test('ingest markdown over budget writes offset windows in read-plan', async () => {
  const root = tmpProject();
  const src = join(root, 'big.md');
  writeFileSync(
    src,
    `# 背景\n\n${'甲'.repeat(30000)}\n\n# 规则\n\n系统必须完成登录。\n\n# 功能说明\n\n仅描述功能范围。\n`,
  );
  const summary = await runIngest(src, {
    projectRoot: root,
    stdout: capture().stream,
    stderr: capture().stream,
    ocr: stubOcr,
  });
  const plan = JSON.parse(readFileSync(summary.readPlan, 'utf8')) as {
    totalChars: number;
    items: { kind: string; id: string; offset: number }[];
  };
  assert.ok(plan.totalChars > 24000);
  assert.ok(plan.items.some((i) => i.kind === 'signals'));
  assert.ok(plan.items.some((i) => i.id === 's-3'));
  assert.equal(plan.items.some((i) => i.id === 's-1'), false);
});

test('ingest English markdown over budget includes Features keyword sections', async () => {
  const root = tmpProject();
  const src = join(root, 'prd-en.md');
  writeFileSync(
    src,
    `# Background\n\n${'x'.repeat(30000)}\n\n# Rules\n\nThe system must complete login.\n\n# Features\n\nScope of the feature set only.\n`,
  );
  const summary = await runIngest(src, {
    projectRoot: root,
    stdout: capture().stream,
    stderr: capture().stream,
    ocr: stubOcr,
  });
  const signals = readFileSync(join(summary.cache, 'signals.md'), 'utf8');
  assert.match(signals, /The system must complete login\./);
  const plan = JSON.parse(readFileSync(summary.readPlan, 'utf8')) as {
    items: { kind: string; id: string }[];
  };
  assert.ok(plan.items.some((i) => i.kind === 'signals'));
  assert.ok(plan.items.some((i) => i.id === 's-3'));
  assert.equal(plan.items.some((i) => i.id === 's-1'), false);
});

test('small docx ingest keeps 必须 and does not put body on stdout', async () => {
  const root = tmpProject();
  const src = join(root, 'prd.docx');
  writeFileSync(src, makeDocx({ heading: '规则', body: '系统必须完成登录。' }));
  const stdout = capture();
  const stderr = capture();
  const summary = await runIngest(src, {
    projectRoot: root,
    stdout: stdout.stream,
    stderr: stderr.stream,
    ocr: stubOcr,
  });
  assert.equal(stdout.text.includes('必须完成登录'), false);
  assert.match(stderr.text, /prd\.docx/);
  assert.match(readFileSync(join(summary.cache, 'signals.md'), 'utf8'), /必须完成登录/);
});

test('pdf text ingest reports same-line page progress', async () => {
  const root = tmpProject();
  const src = join(root, 'spec.pdf');
  writeFileSync(src, buildPdf(['Page one must login', 'Page two', 'Page three']));
  const stdout = capture();
  const stderr = capture();
  await runIngest(src, {
    projectRoot: root,
    stdout: stdout.stream,
    stderr: stderr.stream,
    ocr: stubOcr,
  });
  assert.equal(stdout.text.includes('Page one must login'), false);
  assert.match(stderr.text, /spec\.pdf/);
  assert.match(stderr.text, /pages 3\/3/);
  const pageLines = stderr.text.split('\n').filter((line) => /^抽出文本  pages /.test(line));
  assert.ok(pageLines.length <= 1);
});

test('pdf without a text layer fails with exit code 2', async () => {
  const root = tmpProject();
  const src = join(root, 'empty.pdf');
  writeFileSync(src, emptyPdf());
  await assert.rejects(
    () =>
      runIngest(src, {
        projectRoot: root,
        stdout: capture().stream,
        stderr: capture().stream,
        ocr: stubOcr,
      }),
    (err: unknown) => {
      assert.ok(err instanceof IngestError);
      assert.equal(err.exitCode, 2);
      return true;
    },
  );
});

test('docx drops tiny icons, keeps 流程图 figures, empty OCR does not call a model', async () => {
  const root = tmpProject();
  const src = join(root, 'flow.docx');
  writeFileSync(
    src,
    makeDocx({
      heading: '流程',
      body: '见下图。',
      images: [
        { name: 'icon.png', bytes: tinyPng() },
        { name: 'flow.png', bytes: noisyPng(120, 120), caption: '流程图' },
      ],
    }),
  );
  let ocrCalls = 0;
  const model = {
    complete(): string {
      throw new Error('model interface must not be called');
    },
  };
  const summary = await runIngest(src, {
    projectRoot: root,
    stdout: capture().stream,
    stderr: capture().stream,
    ocr: async () => {
      ocrCalls += 1;
      void model;
      return '';
    },
  });
  const figures = JSON.parse(readFileSync(join(summary.cache, 'figures.json'), 'utf8')) as {
    figures: { id: string; kept: boolean; reason: string; ocr?: string; caption?: string }[];
  };
  const dropped = figures.figures.find((f) => f.reason === 'too-small');
  const kept = figures.figures.find((f) => f.kept);
  assert.ok(dropped);
  assert.equal(dropped?.kept, false);
  assert.ok(kept);
  assert.equal(kept?.caption, '流程图');
  assert.equal(kept?.ocr, 'empty');
  assert.equal(ocrCalls, 1);
  const figMd = readFileSync(join(summary.cache, 'figures', `${kept!.id}.md`), 'utf8');
  assert.match(figMd, /题注：流程图/);
  assert.equal(figMd.includes('OCR：'), false);
  assert.equal(existsSync(join(summary.cache, 'images', `${dropped!.id}.png`)), false);
});

test('cache hit prints 使用缓存 and skips restaging', async () => {
  const root = tmpProject();
  const src = join(root, 'prd.md');
  writeFileSync(src, '# A\n\nhello\n');
  await runIngest(src, {
    projectRoot: root,
    stdout: capture().stream,
    stderr: capture().stream,
    ocr: stubOcr,
  });
  const stderr = capture();
  const summary = await runIngest(src, {
    projectRoot: root,
    stdout: capture().stream,
    stderr: stderr.stream,
    ocr: stubOcr,
  });
  assert.equal(summary.cacheHit, true);
  assert.match(stderr.text, /使用缓存/);
  assert.equal(stderr.text.includes('抽出文本'), false);
});

test('generated skills do not bundle ingest parsers', () => {
  const skillRoot = join(process.cwd(), 'src/schemas/templates/skills');
  function walk(dir: string): string[] {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) {
        out.push(...walk(p));
      } else {
        out.push(p);
      }
    }
    return out;
  }
  const files = walk(skillRoot);
  assert.equal(files.some((f) => /ingest|mammoth|unpdf|tesseract|word-extractor/.test(f)), false);
});
