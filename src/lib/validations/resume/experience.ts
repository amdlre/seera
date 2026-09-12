import { z } from "zod";

/**
 * Full validation for one work-experience entry. `superRefine` enforces the
 * end-date-after-start-date rule from ATS-CRITERIA.md §4 and requires an end
 * date unless the entry is marked as current.
 */
export const experienceItemSchema = z
  .object({
    titleAr: z.string().min(1, { message: "validation.required" }),
    titleEn: z.string().min(1, { message: "validation.required" }),
    company: z.string().min(1, { message: "validation.required" }),
    cityCountry: z.string().min(1, { message: "validation.required" }),
    startMonth: z.number().int().min(1).max(12).nullable(),
    startYear: z.number().int().nullable(),
    endMonth: z.number().int().min(1).max(12).nullable(),
    endYear: z.number().int().nullable(),
    isCurrent: z.boolean(),
    bulletsAr: z.array(z.string().min(1)).min(1, { message: "validation.required" }),
    bulletsEn: z.array(z.string().min(1)).min(1, { message: "validation.required" }),
  })
  .superRefine((data, ctx) => {
    if (data.startMonth === null || data.startYear === null) {
      ctx.addIssue({ code: "custom", message: "validation.required", path: ["startMonth"] });
      return;
    }
    if (!data.isCurrent && (data.endMonth === null || data.endYear === null)) {
      ctx.addIssue({
        code: "custom",
        message: "validation.required",
        path: ["endMonth"],
      });
      return;
    }
    if (!data.isCurrent && data.endYear !== null && data.endMonth !== null) {
      const start = data.startYear * 12 + data.startMonth;
      const end = data.endYear * 12 + data.endMonth;
      if (end < start) {
        ctx.addIssue({
          code: "custom",
          message: "validation.dateOrder",
          path: ["endMonth"],
        });
      }
    }
  });

export const experienceItemDraftSchema = z.object({
  titleAr: z.string().optional(),
  titleEn: z.string().optional(),
  company: z.string().optional(),
  cityCountry: z.string().optional(),
  startMonth: z.number().int().min(1).max(12).nullable().optional(),
  startYear: z.number().int().nullable().optional(),
  endMonth: z.number().int().min(1).max(12).nullable().optional(),
  endYear: z.number().int().nullable().optional(),
  isCurrent: z.boolean().optional(),
  bulletsAr: z.array(z.string()).optional(),
  bulletsEn: z.array(z.string()).optional(),
});

export type ExperienceItemInput = z.infer<typeof experienceItemSchema>;
export type ExperienceItemDraftInput = z.infer<typeof experienceItemDraftSchema>;

export const EMPTY_EXPERIENCE_ITEM: ExperienceItemDraftInput = {
  titleAr: "",
  titleEn: "",
  company: "",
  cityCountry: "",
  startMonth: null,
  startYear: null,
  endMonth: null,
  endYear: null,
  isCurrent: false,
  bulletsAr: [""],
  bulletsEn: [""],
};
