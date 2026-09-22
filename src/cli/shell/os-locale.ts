/**
 * Detect the OS UI language and normalize it to a BCP 47 tag used by sparrow-config `lang`.
 */

import { execFileSync } from 'node:child_process';

export const DEFAULT_LANG = 'zh-Hans';

/** Common codes shown in `sparrow init` help. Not a closed set. */
export const COMMON_LANGS: { code: string; label: string }[] = [
  { code: 'zh-Hans', label: '中文（简体）' },
  { code: 'zh-Hant', label: '中文（繁体）' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
];

const LANG_RE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

export function isValidLang(code: string): boolean {
  return LANG_RE.test(code);
}

export function formatCommonLangs(): string {
  return COMMON_LANGS.map((item) => `  ${item.code.padEnd(10)} ${item.label}`).join('\n');
}

/**
 * Turn an OS locale string into a BCP 47 tag.
 * Chinese is collapsed to zh-Hans or zh-Hant; other languages keep the primary subtag.
 */
export function normalizeLocale(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let text = raw.trim();
  if (!text || text === 'C' || text === 'POSIX') return null;

  const quoted = text.match(/"([^"]+)"/);
  if (quoted) text = quoted[1];

  text = text.split(/\s+/)[0] ?? text;
  text = text.split('.')[0] ?? text;
  text = text.replace(/_/g, '-');

  const parts = text.split('-').filter(Boolean);
  if (parts.length === 0) return null;
  const lang = parts[0].toLowerCase();
  if (!/^[a-z]{2,3}$/.test(lang)) return null;

  if (lang === 'zh') {
    const rest = parts.slice(1).map((part) => part.toLowerCase());
    if (rest.some((part) => part === 'hant' || part === 'tw' || part === 'hk' || part === 'mo')) {
      return 'zh-Hant';
    }
    return 'zh-Hans';
  }

  return lang;
}

export type LocaleReader = (platform: NodeJS.Platform) => string | null;

function readDarwin(): string | null {
  const out = execFileSync('defaults', ['read', '-g', 'AppleLanguages'], {
    encoding: 'utf-8',
    timeout: 3000,
  });
  return out.trim() || null;
}

function readWindows(): string | null {
  const out = execFileSync(
    'powershell.exe',
    ['-NoProfile', '-Command', '[cultureinfo]::CurrentUICulture.Name'],
    { encoding: 'utf-8', timeout: 5000 },
  );
  return out.trim() || null;
}

function readLinux(env: NodeJS.ProcessEnv): string | null {
  const raw = env.LC_ALL || env.LC_MESSAGES || env.LANG || '';
  return raw.trim() || null;
}

/**
 * Read the current OS UI language. Returns null when the platform is unsupported
 * or the lookup fails.
 */
export function detectOsLocale(opts?: {
  platform?: NodeJS.Platform;
  read?: LocaleReader;
  env?: NodeJS.ProcessEnv;
}): string | null {
  const platform = opts?.platform ?? process.platform;
  if (platform !== 'darwin' && platform !== 'win32' && platform !== 'linux') return null;
  try {
    if (opts?.read) return normalizeLocale(opts.read(platform));
    if (platform === 'darwin') return normalizeLocale(readDarwin());
    if (platform === 'win32') return normalizeLocale(readWindows());
    if (platform === 'linux') return normalizeLocale(readLinux(opts?.env ?? process.env));
    return null;
  } catch {
    return null;
  }
}

/**
 * Resolve the document language for init.
 * `--lang` wins; otherwise keep an existing config value; otherwise detect the OS; else zh-Hans.
 */
export function resolveInitLang(input: {
  explicit?: string;
  existing?: unknown;
  detected?: string | null;
}): string {
  if (input.explicit !== undefined && input.explicit !== '') {
    if (!isValidLang(input.explicit)) {
      throw new Error(
        `Invalid --lang "${input.explicit}". Use a BCP 47 code, for example:\n${formatCommonLangs()}`,
      );
    }
    return input.explicit;
  }
  if (typeof input.existing === 'string' && input.existing.trim() && isValidLang(input.existing.trim())) {
    return input.existing.trim();
  }
  return input.detected ?? DEFAULT_LANG;
}
