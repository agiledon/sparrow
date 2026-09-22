declare module 'word-extractor' {
  class WordExtractor {
    extract(source: string | Buffer): Promise<{
      getBody(): string;
      getHeaders(options?: { includeFooters?: boolean }): string;
    }>;
  }
  export default WordExtractor;
}
