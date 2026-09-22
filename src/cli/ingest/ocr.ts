export type OcrFn = (image: Buffer, mime: string) => Promise<string>;

export async function defaultOcr(image: Buffer, _mime: string): Promise<string> {
  const tesseract = await import('tesseract.js');
  const createWorker = tesseract.createWorker ?? (tesseract as { default?: { createWorker: typeof tesseract.createWorker } }).default?.createWorker;
  if (!createWorker) {
    throw new Error('tesseract.js createWorker is unavailable');
  }
  const worker = await createWorker('chi_sim+eng');
  try {
    const result = await worker.recognize(image);
    return (result.data.text ?? '').trim();
  } finally {
    await worker.terminate();
  }
}
