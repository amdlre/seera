import { z } from "zod";

const optionalUrl = z
  .string()
  .url({ message: "validation.url" })
  .optional()
  .or(z.literal(""));

/** Full validation used by the client form's Zod resolver (drives required-field UI). */
export const personalInfoSchema = z.object({
  fullNameAr: z.string().min(1, { message: "validation.required" }),
  fullNameEn: z.string().min(1, { message: "validation.required" }),
  targetJobTitleAr: z.string().min(1, { message: "validation.required" }),
  targetJobTitleEn: z.string().min(1, { message: "validation.required" }),
  email: z
    .string()
    .min(1, { message: "validation.required" })
    .email({ message: "validation.email" }),
  phone: z
    .string()
    .min(1, { message: "validation.required" })
    .regex(/^\+?[0-9 ]{8,15}$/, { message: "validation.phone" }),
  cityCountryAr: z.string().min(1, { message: "validation.required" }),
  cityCountryEn: z.string().min(1, { message: "validation.required" }),
  linkedin: optionalUrl,
  portfolioUrl: optionalUrl,
});

/**
 * Relaxed variant used server-side for autosave: every field optional so a
 * partially-filled draft can persist, while present values are still validated.
 */
export const personalInfoDraftSchema = personalInfoSchema.partial();

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type PersonalInfoDraftInput = z.infer<typeof personalInfoDraftSchema>;
