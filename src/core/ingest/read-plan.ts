import { CHAR_BUDGET } from './constants.js';

export interface ReadPlanItem {
  kind: 'chunk' | 'signals' | 'figure';
  id: string;
  file: string;
  offset: number;
  chars: number;
  command: string;
}

export interface ReadPlan {
  budget: number;
  totalChars: number;
  items: ReadPlanItem[];
}

export interface SectionPlanInput {
  id: string;
  chars: number;
  signalCount: number;
  keywordHit: boolean;
}

export function offsetWindows(chars: number, budget = CHAR_BUDGET): { offset: number; chars: number }[] {
  if (chars <= 0) {
    return [{ offset: 0, chars: 0 }];
  }
  if (chars <= budget) {
    return [{ offset: 0, chars }];
  }
  const windows: { offset: number; chars: number }[] = [];
  for (let offset = 0; offset < chars; offset += budget) {
    windows.push({ offset, chars: Math.min(budget, chars - offset) });
  }
  return windows;
}

function showCommand(sourcePath: string, section: string, offset: number): string {
  const quoted = /\s/.test(sourcePath) ? JSON.stringify(sourcePath) : sourcePath;
  const extra = offset > 0 ? ` --offset ${offset}` : '';
  return `sparrow ingest show ${quoted} --section ${section}${extra}`;
}

export function buildReadPlan(opts: {
  sourcePath: string;
  totalChars: number;
  sections: SectionPlanInput[];
  figureIds: string[];
  signalsChars: number;
  budget?: number;
}): ReadPlan {
  const budget = opts.budget ?? CHAR_BUDGET;
  const items: ReadPlanItem[] = [];
  const pushWindows = (kind: ReadPlanItem['kind'], id: string, file: string, chars: number): void => {
    for (const win of offsetWindows(chars, budget)) {
      items.push({
        kind,
        id,
        file,
        offset: win.offset,
        chars: win.chars,
        command: showCommand(opts.sourcePath, id, win.offset),
      });
    }
  };

  if (opts.totalChars <= budget) {
    for (const section of opts.sections) {
      pushWindows('chunk', section.id, `chunks/${section.id}.md`, section.chars);
    }
    for (const id of opts.figureIds) {
      items.push({
        kind: 'figure',
        id,
        file: `figures/${id}.md`,
        offset: 0,
        chars: 0,
        command: showCommand(opts.sourcePath, id, 0),
      });
    }
  } else {
    if (opts.signalsChars > 0) {
      pushWindows('signals', 'signals', 'signals.md', opts.signalsChars);
    }
    for (const section of opts.sections) {
      if (section.signalCount === 0 && section.keywordHit) {
        pushWindows('chunk', section.id, `chunks/${section.id}.md`, section.chars);
      }
    }
    for (const id of opts.figureIds) {
      items.push({
        kind: 'figure',
        id,
        file: `figures/${id}.md`,
        offset: 0,
        chars: 0,
        command: showCommand(opts.sourcePath, id, 0),
      });
    }
  }

  return {
    budget,
    totalChars: opts.totalChars,
    items,
  };
}
