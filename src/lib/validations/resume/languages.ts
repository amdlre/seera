import { z } from "zod";

export const languageLevelEnum = z.enum(["native", "advanced", "intermediate", "basic"]);
export type LanguageLevel = z.infer<typeof languageLevelEnum>;

export const languageItemSchema = z.object({
  languageAr: z.string().min(1, { message: "validation.required" }),
  languageEn: z.string().min(1, { message: "validation.required" }),
  level: languageLevelEnum,
  detail: z.string().optional().or(z.literal("")),
});

export const languageItemDraftSchema = z.object({
  languageAr: z.string().optional(),
  languageEn: z.string().optional(),
  level: languageLevelEnum.optional(),
  detail: z.string().optional(),
});

export type LanguageItemInput = z.infer<typeof languageItemSchema>;
export type LanguageItemDraftInput = z.infer<typeof languageItemDraftSchema>;

export const EMPTY_LANGUAGE_ITEM: LanguageItemDraftInput = {
  languageAr: "",
  languageEn: "",
  level: "intermediate",
  detail: "",
};
