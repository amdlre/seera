/** Employment types a work-experience entry can carry. */
export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "freelance",
  "internship",
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

/**
 * Full-time is the assumed default on a resume, so printing it on every
 * entry is noise; only the other types are shown in the entry's meta line.
 */
export const EMPLOYMENT_TYPE_OMITTED_IN_PRINT: EmploymentType = "full_time";

/** Type guard for an employment type stored in an item's JSON data. */
export function isEmploymentType(value: unknown): value is EmploymentType {
  return typeof value === "string" && (EMPLOYMENT_TYPES as readonly string[]).includes(value);
}
