/**
 * Error helpers for child_process exec calls.
 */

export interface ExecSyncTimeoutError extends Error {
  status: number | null;
  signal: string | null;
}

/**
 * Type guard for an execSync timeout error. Node kills the child with SIGTERM
 * on timeout, so the error carries `status: null` and `signal: 'SIGTERM'`.
 */
export function isExecSyncTimeoutError(e: unknown): e is ExecSyncTimeoutError {
  if (!(e instanceof Error)) return false;
  const err = e as { status?: unknown; signal?: unknown };
  return err.status === null && err.signal === 'SIGTERM';
}
