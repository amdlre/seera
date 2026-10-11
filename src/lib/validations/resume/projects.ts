import { z } from "zod";
import { optionalUrl } from "@/lib/validations/shared";

/**
 * One project entry: bilingual name and achievement bullets, an optional
 * public link, and the technologies used (a comma-separated tag list,
 * written once since tech names are the same in both resumes).
 */
export const projectItemSchema = z.object({
  nameAr: z.string().min(1, { message: "validation.required" }),
  nameEn: z.string().min(1, { message: "validation.required" }),
  url: optionalUrl,
  technologies: z.string().min(1, { message: "validation.required" }),
  bulletsAr: z.array(z.string().min(1)).min(1, { message: "validation.required" }),
  bulletsEn: z.array(z.string().min(1)).min(1, { message: "validation.required" }),
});

export const projectItemDraftSchema = z.object({
  nameAr: z.string().optional(),
  nameEn: z.string().optional(),
  url: z.string().max(500).optional(),
  technologies: z.string().optional(),
  bulletsAr: z.array(z.string()).optional(),
  bulletsEn: z.array(z.string()).optional(),
});

export type ProjectItemInput = z.infer<typeof projectItemSchema>;
export type ProjectItemDraftInput = z.infer<typeof projectItemDraftSchema>;

export const EMPTY_PROJECT_ITEM: ProjectItemDraftInput = {
  nameAr: "",
  nameEn: "",
  url: "",
  technologies: "",
  bulletsAr: [""],
  bulletsEn: [""],
};
