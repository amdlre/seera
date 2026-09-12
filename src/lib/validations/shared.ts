import { z } from "zod";

/**
 * One field of an autosaved draft: any string up to `max`, or absent.
 * A draft is saved while the user is still typing, so half-finished values
 * ("bas" on the way to an email) must persist — format and required-ness are
 * enforced by the strict schema that drives the form UI, never here.
 */
export function draftText(max: number) {
  return z.string().max(max, { message: "validation.maxLength" }).optional();
}

/**
 * Accepts URLs with or without a protocol — ATS-CRITERIA.md's own examples
 * write `linkedin.com/in/username`, not `https://linkedin.com/in/username`.
 * Optional: an empty string is also valid (field left blank).
 */
export const optionalUrl = z
  .string()
  .refine(
    (value) => {
      try {
        new URL(value.includes("://") ? value : `https://${value}`);
        return true;
      } catch {
        return false;
      }
    },
    { message: "validation.url" },
  )
  .optional()
  .or(z.literal(""));
