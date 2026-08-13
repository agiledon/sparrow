/**
 * Semantic version comparison.
 */

/**
 * Returns true if `latest` is newer than `local`.
 * Compares major, then minor, then patch (numeric comparison).
 */
export function compareVersions(local: string, latest: string): boolean {
  const parse = (v: string) => v.split('.').map(Number);
  const localParts = parse(local);
  const latestParts = parse(latest);
  return (
    latestParts[0] > localParts[0] ||
    (latestParts[0] === localParts[0] && latestParts[1] > localParts[1]) ||
    (latestParts[0] === localParts[0] && latestParts[1] === localParts[1] && latestParts[2] > localParts[2])
  );
}
