export interface ProgressWriter {
  write(chunk: string): void;
}

export interface IngestProgress {
  file(absPath: string): void;
  stage(name: string): void;
  pages(current: number, total: number): void;
  figures(current: number, total: number): void;
  ocr(current: number, total: number): void;
  cacheHit(): void;
  end(info: { cache: string; sections: number; figures: number; readPlan: string }): void;
  finishTick(): void;
}

function createNullProgress(): IngestProgress {
  const noop = (): void => {};
  return {
    file: noop,
    stage: noop,
    pages: noop,
    figures: noop,
    ocr: noop,
    cacheHit: noop,
    end: noop,
    finishTick: noop,
  };
}

export function createProgress(stream?: ProgressWriter | null): IngestProgress {
  if (!stream) {
    return createNullProgress();
  }
  let needNewline = false;
  const writeLine = (line: string): void => {
    if (needNewline) {
      stream.write('\n');
      needNewline = false;
    }
    stream.write(`${line}\n`);
  };
  const tick = (line: string): void => {
    stream.write(`\r${line}`);
    needNewline = true;
  };
  return {
    file(absPath: string): void {
      writeLine(absPath);
    },
    stage(name: string): void {
      writeLine(name);
    },
    pages(current: number, total: number): void {
      tick(`抽出文本  pages ${current}/${total}`);
    },
    figures(current: number, total: number): void {
      tick(`抽图  ${current}/${total}`);
    },
    ocr(current: number, total: number): void {
      tick(`OCR  ocr ${current}/${total}`);
    },
    cacheHit(): void {
      writeLine('使用缓存');
    },
    end(info: { cache: string; sections: number; figures: number; readPlan: string }): void {
      writeLine(`缓存 ${info.cache}  节 ${info.sections}  图 ${info.figures}`);
      writeLine(info.readPlan);
    },
    finishTick(): void {
      if (needNewline) {
        stream.write('\n');
        needNewline = false;
      }
    },
  };
}
