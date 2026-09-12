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
