import { z } from "zod";

export const customSectionLayoutEnum = z.enum(["bullets", "dated_entries", "paragraph"]);

export const createCustomSectionSchema = z.object({
  titleAr: z.string().min(1, { message: "validation.required" }),
  titleEn: z.string().min(1, { message: "validation.required" }),
  layout: customSectionLayoutEnum,
});

export type CreateCustomSectionInput = z.infer<typeof createCustomSectionSchema>;

/** Standard section titles the ATS-CRITERIA.md warns not to stray from (§9). */
export const STANDARD_SECTION_TITLES_AR = [
  "المعلومات الشخصية",
  "الملخص المهني",
  "الخبرات العملية",
  "التعليم",
  "المهارات",
  "الشهادات المهنية",
  "اللغات",
  "المشاريع",
];

export function isNonStandardTitle(titleAr: string): boolean {
  return !STANDARD_SECTION_TITLES_AR.includes(titleAr.trim());
}

/** One bullet point in a custom "bullets"-layout section. */
export const customBulletItemDraftSchema = z.object({
  textAr: z.string().optional(),
  textEn: z.string().optional(),
});
export type CustomBulletItemDraftInput = z.infer<typeof customBulletItemDraftSchema>;
export const EMPTY_CUSTOM_BULLET_ITEM: CustomBulletItemDraftInput = { textAr: "", textEn: "" };

/** One entry in a custom "dated_entries"-layout section. */
export const customDatedItemDraftSchema = z.object({
  titleAr: z.string().optional(),
  titleEn: z.string().optional(),
  startMonth: z.number().int().min(1).max(12).nullable().optional(),
  startYear: z.number().int().nullable().optional(),
  endMonth: z.number().int().min(1).max(12).nullable().optional(),
  endYear: z.number().int().nullable().optional(),
  isCurrent: z.boolean().optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
});
export type CustomDatedItemDraftInput = z.infer<typeof customDatedItemDraftSchema>;
export const EMPTY_CUSTOM_DATED_ITEM: CustomDatedItemDraftInput = {
  titleAr: "",
  titleEn: "",
  startMonth: null,
  startYear: null,
  endMonth: null,
  endYear: null,
  isCurrent: false,
  descriptionAr: "",
  descriptionEn: "",
};

/** The single item in a custom "paragraph"-layout section. */
export const customParagraphItemDraftSchema = z.object({
  textAr: z.string().optional(),
  textEn: z.string().optional(),
});
export type CustomParagraphItemDraftInput = z.infer<typeof customParagraphItemDraftSchema>;
export const EMPTY_CUSTOM_PARAGRAPH_ITEM: CustomParagraphItemDraftInput = {
  textAr: "",
  textEn: "",
};
