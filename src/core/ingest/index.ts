export { CHAR_BUDGET, INGEST_DIR } from './constants.js';
export { IngestError } from './errors.js';
export { decideFigure } from './figures.js';
export { extractSignals } from './signals.js';
export { splitMarkdown, splitPlainText } from './split.js';
export { buildReadPlan, offsetWindows } from './read-plan.js';
export { formatIngestShowCommand, INGEST_SHOW_CMD } from './cli-strings.js';
export { noisyPng, encodePng } from './png.js';
export { zipStore } from './zip.js';
export {
  runIngest,
  showSection,
  runClean,
  cleanupIngestCache,
  ingestRoot,
} from './run.js';
export type { IngestOptions, IngestSummary } from './run.js';
export type { OcrFn } from './ocr.js';
