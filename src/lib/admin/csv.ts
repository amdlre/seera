function escapeCsvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Builds a CSV string (with header row) from an array of plain objects. */
export function buildCsv<T extends Record<string, string | number>>(
  rows: T[],
  columns: { key: keyof T; label: string }[],
): string {
  const header = columns.map((column) => escapeCsvCell(column.label)).join(",");
  const body = rows
    .map((row) => columns.map((column) => escapeCsvCell(row[column.key])).join(","))
    .join("\n");

  return `${header}\n${body}`;
}
