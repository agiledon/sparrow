import { DIAGRAM_RE, MIN_FIGURE_BYTES, MIN_FIGURE_PX } from './constants.js';

export interface FigureDecisionInput {
  width?: number;
  height?: number;
  bytes: number;
  inHeaderFooter: boolean;
  caption: string;
  alt: string;
  nearbyText: string;
}

export interface FigureDecision {
  keep: boolean;
  reason: 'header-footer' | 'too-small' | 'caption' | 'body-size';
}

export function decideFigure(fig: FigureDecisionInput): FigureDecision {
  if (fig.inHeaderFooter) {
    return { keep: false, reason: 'header-footer' };
  }
  const smallPx =
    (fig.width != null && fig.width < MIN_FIGURE_PX) ||
    (fig.height != null && fig.height < MIN_FIGURE_PX);
  if (smallPx || fig.bytes < MIN_FIGURE_BYTES) {
    return { keep: false, reason: 'too-small' };
  }
  const blob = `${fig.caption}\n${fig.alt}\n${fig.nearbyText}`;
  if (DIAGRAM_RE.test(blob)) {
    return { keep: true, reason: 'caption' };
  }
  return { keep: true, reason: 'body-size' };
}

export function formatFigureMarkdown(id: string, caption: string, ocrText: string): string {
  const lines = [`# ${id}`, ''];
  if (caption.trim()) {
    lines.push(`题注：${caption.trim()}`, '');
  }
  if (ocrText.trim()) {
    lines.push('OCR：', ocrText.trim(), '');
  }
  return `${lines.join('\n').replace(/\n+$/, '')}\n`;
}
