export const CHAR_BUDGET = 24_000;
export const MIN_FIGURE_PX = 80;
export const MIN_FIGURE_BYTES = 8 * 1024;
export const CACHE_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
export const CACHE_MAX_BYTES = 200 * 1024 * 1024;
export const HASH_PREFIX_LEN = 12;

const SIGNAL_ZH = '必须|应当|不得|禁止|如果|(?:当.{0,80}则)';
const SIGNAL_EN =
  String.raw`\b(?:shall|must|should|when|if)\b|(?:\b(?:if|when)\b.{0,80}\bthen\b)|\b(?:must|shall|may)\s+not\b|\bmustn't\b|\bforbidden\b|\bprohibit(?:ed|ion)?\b`;

const KEYWORD_ZH = '功能|规则|流程|需求|场景|角色|约束';
const KEYWORD_EN =
  String.raw`\b(?:features?|functions?|functionality|rules?|process(?:es)?|flows?|workflows?|requirements?|scenarios?|roles?|actors?|constraints?)\b`;

const DIAGRAM_ZH = '流程|用例|时序|状态|活动|泳道|架构|上下文';
const DIAGRAM_EN =
  String.raw`\b(?:flowcharts?|flows?|process(?:es)?|workflows?|use\s+cases?|sequences?|states?|activity|activities|swim\s*-?\s*lanes?|architecture|contexts?)\b`;

const CAPTION_ZH = String.raw`图\s*\d+|流程图|用例图|时序图|状态图|活动图`;
const CAPTION_EN =
  String.raw`\bfigures?\s*\d+\b|\bfigure\b|\bflowchart\b|\buse\s+case\s+diagram\b|\bsequence\s+diagram\b|\bstate\s+diagram\b|\bactivity\s+diagram\b`;

export const SIGNAL_RE = new RegExp(`${SIGNAL_ZH}|${SIGNAL_EN}`, 'i');
export const NUMBERED_RE = /^\s*\d+[\.、)]\s+\S/;
export const TABLE_ROW_RE = /^\s*\|.+\|/;
export const KEYWORD_RE = new RegExp(`${KEYWORD_ZH}|${KEYWORD_EN}`, 'i');
export const DIAGRAM_RE = new RegExp(`${DIAGRAM_ZH}|${DIAGRAM_EN}`, 'i');
export const CAPTION_RE = new RegExp(`${CAPTION_ZH}|${CAPTION_EN}`, 'i');

export const INGEST_DIR = '.sparrow/ingest';
