export interface SplitSection {
  heading: string;
  body: string;
}

const MD_HEADING = /^(#{1,6})\s+\S/;
const DOC_HEADING =
  /^(?:第[一二三四五六七八九十百千0-9]+[章节条款篇]|(?:\d+\.)+\d*|[一二三四五六七八九十]+[、.．])\s+\S/;

export function splitMarkdown(text: string): SplitSection[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  const sections: SplitSection[] = [];
  let heading = '';
  let body: string[] = [];
  const flush = (): void => {
    const bodyText = body.join('\n').replace(/\s+$/, '');
    if (!heading && !bodyText.trim()) {
      return;
    }
    sections.push({ heading, body: bodyText });
    heading = '';
    body = [];
  };
  for (const line of lines) {
    if (MD_HEADING.test(line)) {
      flush();
      heading = line.trimEnd();
      body = [];
    } else {
      body.push(line);
    }
  }
  flush();
  return sections.length > 0 ? sections : [{ heading: '', body: text.replace(/^\uFEFF/, '') }];
}

export function splitPlainText(text: string): SplitSection[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
  const lines = normalized.split('\n');
  const sections: SplitSection[] = [];
  let heading = '';
  let body: string[] = [];
  const flush = (): void => {
    const bodyText = body.join('\n').replace(/\s+$/, '');
    if (!heading && !bodyText.trim()) {
      return;
    }
    sections.push({ heading, body: bodyText });
    heading = '';
    body = [];
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (MD_HEADING.test(trimmed) || DOC_HEADING.test(trimmed)) {
      flush();
      heading = trimmed;
      body = [];
    } else {
      body.push(line);
    }
  }
  flush();
  if (sections.length > 0) {
    return sections;
  }
  return splitByBlankAndNumbers(normalized);
}

function splitByBlankAndNumbers(text: string): SplitSection[] {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 0) {
    return [{ heading: '', body: text }];
  }
  const sections: SplitSection[] = [];
  for (const block of blocks) {
    const numbered = block.split(/(?=^\s*\d+[\.、)]\s+)/m).map((p) => p.trim()).filter(Boolean);
    for (const part of numbered) {
      const first = part.split('\n', 1)[0] ?? '';
      const rest = part.slice(first.length).replace(/^\n/, '');
      if (/^\s*\d+[\.、)]\s+/.test(first) && rest.trim()) {
        sections.push({ heading: first.trim(), body: rest });
      } else {
        sections.push({ heading: '', body: part });
      }
    }
  }
  return sections.length > 0 ? sections : [{ heading: '', body: text }];
}

export function formatChunk(section: SplitSection): string {
  if (section.heading) {
    return section.body ? `${section.heading}\n\n${section.body}\n` : `${section.heading}\n`;
  }
  return section.body.endsWith('\n') ? section.body : `${section.body}\n`;
}
