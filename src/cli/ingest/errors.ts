export class IngestError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 1) {
    super(message);
    this.name = 'IngestError';
    this.exitCode = exitCode;
  }
}
