/**
 * Returns a safe visible name for a breeding pair.
 *
 * Legacy pairs migrated from the V1 model do not necessarily contain the
 * optional `name` property. UI components must therefore never call string
 * methods directly on `pair.name`.
 */
export function getBreedingPairDisplayName(
  pair: { name?: string } | undefined,
  fallback: string,
): string {
  const name = pair?.name?.trim();
  return name || fallback;
}
