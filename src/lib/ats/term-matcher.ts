import { normalizeText, termPattern } from "./text-normalize";
import { VOCABULARY } from "./vocabulary";

type Span = { termId: string; start: number; end: number };

function collectCandidateSpans(normalizedText: string): Span[] {
  const spans: Span[] = [];
  for (const term of VOCABULARY) {
    for (const alias of term.normalizedAliases) {
      const pattern = termPattern(alias);
      for (const match of normalizedText.matchAll(pattern)) {
        const start = match.index ?? 0;
        spans.push({ termId: term.id, start, end: start + match[0].length });
      }
    }
  }
  return spans;
}

/**
 * Finds every vocabulary term in free text and how often each occurs.
 * Overlapping matches resolve to the longest one, so "UI/UX" counts once as
 * UI/UX (not also as UI and UX) and "React Native" doesn't also count as React.
 */
export function findTerms(text: string): Map<string, number> {
  const normalized = normalizeText(text);
  const counts = new Map<string, number>();
  if (!normalized) return counts;

  const spans = collectCandidateSpans(normalized).sort(
    (a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start,
  );

  const accepted: Span[] = [];
  for (const span of spans) {
    const overlaps = accepted.some((kept) => span.start < kept.end && kept.start < span.end);
    if (overlaps) continue;
    accepted.push(span);
    counts.set(span.termId, (counts.get(span.termId) ?? 0) + 1);
  }

  return counts;
}
