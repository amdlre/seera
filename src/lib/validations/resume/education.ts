import { z } from "zod";

export const educationItemSchema = z.object({
  degreeAr: z.string().min(1, { message: "validation.required" }),
  degreeEn: z.string().min(1, { message: "validation.required" }),
  majorAr: z.string().min(1, { message: "validation.required" }),
  majorEn: z.string().min(1, { message: "validation.required" }),
  universityAr: z.string().min(1, { message: "validation.required" }),
  universityEn: z.string().min(1, { message: "validation.required" }),
  cityCountry: z.string().optional().or(z.literal("")),
  graduationYear: z.number().int(),
  isExpected: z.boolean(),
  gpaValue: z.number().min(0).nullable().optional(),
  gpaScale: z.union([z.literal(4), z.literal(5)]).nullable().optional(),
});

export const educationItemDraftSchema = z.object({
  degreeAr: z.string().optional(),
  degreeEn: z.string().optional(),
  majorAr: z.string().optional(),
  majorEn: z.string().optional(),
  universityAr: z.string().optional(),
  universityEn: z.string().optional(),
  cityCountry: z.string().optional(),
  graduationYear: z.number().int().nullable().optional(),
  isExpected: z.boolean().optional(),
  gpaValue: z.number().nullable().optional(),
  gpaScale: z.union([z.literal(4), z.literal(5)]).nullable().optional(),
});

export type EducationItemInput = z.infer<typeof educationItemSchema>;
export type EducationItemDraftInput = z.infer<typeof educationItemDraftSchema>;

export const EMPTY_EDUCATION_ITEM: EducationItemDraftInput = {
  degreeAr: "",
  degreeEn: "",
  majorAr: "",
  majorEn: "",
  universityAr: "",
  universityEn: "",
  cityCountry: "",
  graduationYear: null,
  isExpected: false,
  gpaValue: null,
  gpaScale: null,
};
