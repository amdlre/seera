import { z } from "zod";
import { draftText, optionalUrl } from "@/lib/validations/shared";

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
 * Relaxed variant used server-side for autosave. Built field-by-field rather
 * than with `.partial()`: that only permits a key to be *absent*, while the
 * form always submits every field — so an untouched field arrives as `""` and
 * would fail `min(1)`, silently breaking autosave on every new resume.
 */
export const personalInfoDraftSchema = z.object({
  fullNameAr: draftText(200),
  fullNameEn: draftText(200),
  targetJobTitleAr: draftText(200),
  targetJobTitleEn: draftText(200),
  email: draftText(254),
  phone: draftText(50),
  cityCountryAr: draftText(200),
  cityCountryEn: draftText(200),
  linkedin: draftText(500),
  portfolioUrl: draftText(500),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type PersonalInfoDraftInput = z.infer<typeof personalInfoDraftSchema>;
