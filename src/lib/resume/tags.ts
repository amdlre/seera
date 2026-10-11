/** Separators a user may type between tags: Latin comma, Arabic comma, semicolons, new lines. */
const TAG_SEPARATORS = /[,،;؛\n]+/;

/** How a tag list is stored and printed: "React, Next.js, TypeScript". */
export const TAG_JOINER = ", ";

/** Case- and spacing-insensitive identity of a tag, for duplicate detection. */
export function tagKey(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Splits a stored comma-separated list into clean tags, dropping blanks and duplicates. */
export function parseTags(value: string | undefined): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const rawTag of (value ?? "").split(TAG_SEPARATORS)) {
    const tag = rawTag.trim().replace(/\s+/g, " ");
    if (tag && !seen.has(tagKey(tag))) {
      seen.add(tagKey(tag));
      tags.push(tag);
    }
  }
  return tags;
}

/** Joins tags back into the stored "a, b, c" form. */
export function serializeTags(tags: string[]): string {
  return tags.join(TAG_JOINER);
}

/**
 * Tags that appear in more than one of the given lists (e.g. "React" listed
 * under both "Frameworks" and "Tools"). Returns each duplicate once, as first written.
 */
export function findDuplicateTags(lists: string[][]): string[] {
  const firstSpelling = new Map<string, string>();
  const listCount = new Map<string, number>();
  for (const list of lists) {
    for (const key of new Set(list.map(tagKey))) {
      listCount.set(key, (listCount.get(key) ?? 0) + 1);
    }
    for (const tag of list) {
      if (!firstSpelling.has(tagKey(tag))) firstSpelling.set(tagKey(tag), tag);
    }
  }
  return [...listCount.entries()]
    .filter(([, count]) => count > 1)
    .map(([key]) => firstSpelling.get(key) ?? key);
}
