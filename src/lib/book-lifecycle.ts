export function buildStableBookUpdate<T extends object>(
  existingSlug: string,
  changes: T
): T & { slug: string } {
  return { ...changes, slug: existingSlug };
}
