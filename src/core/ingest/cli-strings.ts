/** CLI fragments for ingest read-plan commands (keep in sync with `src/cli/index.ts`). */

export const INGEST_SHOW_CMD = 'sparrow ingest show';

export function formatIngestShowCommand(opts: {
  sourcePath: string;
  section: string;
  offset?: number;
  projectRoot?: string;
}): string {
  const quotedSource = /\s/.test(opts.sourcePath) ? JSON.stringify(opts.sourcePath) : opts.sourcePath;
  const offset = opts.offset ?? 0;
  const offsetFlag = offset > 0 ? ` --offset ${offset}` : '';
  let rootFlag = '';
  if (opts.projectRoot) {
    const quotedRoot = /\s/.test(opts.projectRoot) ? JSON.stringify(opts.projectRoot) : opts.projectRoot;
    rootFlag = ` --project-root ${quotedRoot}`;
  }
  return `${INGEST_SHOW_CMD} ${quotedSource} --section ${opts.section}${offsetFlag}${rootFlag}`;
}
