function sanitizeSegment(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\p{L}\p{N}_-]/gu, "");
}

/**
 * Builds the export filename `{Name}_{JobTitle}.pdf`, stripped of spaces and
 * special characters, per ATS-CRITERIA.md §2 ("File").
 */
export function buildExportFilename(fullName: string, jobTitle: string): string {
  const namePart = sanitizeSegment(fullName) || "Resume";
  const titlePart = sanitizeSegment(jobTitle);
  return titlePart ? `${namePart}_${titlePart}.pdf` : `${namePart}.pdf`;
}

const FALLBACK_FILENAME = "Resume.pdf";

/**
 * Builds a `Content-Disposition: attachment` value that survives Arabic names:
 * headers must be ASCII, so the real name travels in the RFC 5987 `filename*`
 * field and older clients get an ASCII-only fallback.
 */
export function attachmentDisposition(filename: string): string {
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, "").replace(/^_+|_+(?=\.pdf$)/g, "");
  const safeFallback = /^[\w.-]+\.pdf$/.test(asciiFallback) ? asciiFallback : FALLBACK_FILENAME;
  return `attachment; filename="${safeFallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

/** Reads the real filename back out of an `attachmentDisposition` header value. */
export function filenameFromDisposition(header: string | null): string | null {
  const encoded = header?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (!encoded) return null;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}
