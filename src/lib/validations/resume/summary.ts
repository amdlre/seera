import { z } from "zod";
import { draftText } from "@/lib/validations/shared";

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
 * Relaxed variant used server-side for autosave. Not `.partial()`: the form
 * submits both fields on every keystroke, so the untouched one arrives as `""`
 * and would fail `min(1)`, blocking every autosave until both are filled.
 */
export const summaryDraftSchema = z.object({
  summaryAr: draftText(600),
  summaryEn: draftText(600),
});

export type SummaryInput = z.infer<typeof summarySchema>;
export type SummaryDraftInput = z.infer<typeof summaryDraftSchema>;
