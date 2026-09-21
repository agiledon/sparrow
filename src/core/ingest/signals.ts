import { NUMBERED_RE, SIGNAL_RE, TABLE_ROW_RE } from './constants.js';

export function extractSignals(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    if (TABLE_ROW_RE.test(line) || NUMBERED_RE.test(line) || SIGNAL_RE.test(trimmed)) {
      out.push(trimmed);
    }
  }
  return out;
}
