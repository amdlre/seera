import { z } from "zod";

/** Full validation used by the client form's Zod resolver (drives required-field UI). */
export const summarySchema = z.object({
  summaryAr: z
    .string()
    .min(1, { message: "validation.required" })
    .max(600, { message: "validation.maxLength" }),
  summaryEn: z
    .string()
    .min(1, { message: "validation.required" })
    .max(600, { message: "validation.maxLength" }),
});

/**
 * Relaxed variant used server-side for autosave: every field optional so a
 * partially-filled draft can persist, while present values are still validated.
 */
export const summaryDraftSchema = summarySchema.partial();

export type SummaryInput = z.infer<typeof summarySchema>;
export type SummaryDraftInput = z.infer<typeof summaryDraftSchema>;
