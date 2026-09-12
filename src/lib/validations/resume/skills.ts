import { z } from "zod";

/** One skills category, e.g. "لغات البرمجة" with a comma-separated skill list. */
export const skillCategoryItemSchema = z.object({
  categoryAr: z.string().min(1, { message: "validation.required" }),
  categoryEn: z.string().min(1, { message: "validation.required" }),
  skillsAr: z.string().min(1, { message: "validation.required" }),
  skillsEn: z.string().min(1, { message: "validation.required" }),
});

export const skillCategoryItemDraftSchema = z.object({
  categoryAr: z.string().optional(),
  categoryEn: z.string().optional(),
  skillsAr: z.string().optional(),
  skillsEn: z.string().optional(),
});

export type SkillCategoryItemInput = z.infer<typeof skillCategoryItemSchema>;
export type SkillCategoryItemDraftInput = z.infer<typeof skillCategoryItemDraftSchema>;

export const EMPTY_SKILL_CATEGORY_ITEM: SkillCategoryItemDraftInput = {
  categoryAr: "",
  categoryEn: "",
  skillsAr: "",
  skillsEn: "",
};
