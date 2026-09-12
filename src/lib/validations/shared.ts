import { z } from "zod";

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
