import { z } from "zod";

export const certificationItemSchema = z
  .object({
    nameAr: z.string().min(1, { message: "validation.required" }),
    nameEn: z.string().min(1, { message: "validation.required" }),
    issuerAr: z.string().min(1, { message: "validation.required" }),
    issuerEn: z.string().min(1, { message: "validation.required" }),
    issueMonth: z.number().int().min(1).max(12).nullable(),
    issueYear: z.number().int().nullable(),
    neverExpires: z.boolean(),
    expiryMonth: z.number().int().min(1).max(12).nullable(),
    expiryYear: z.number().int().nullable(),
    credentialId: z.string().optional().or(z.literal("")),
    verificationUrl: z.string().url({ message: "validation.url" }).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.issueMonth === null || data.issueYear === null) {
      ctx.addIssue({ code: "custom", message: "validation.required", path: ["issueMonth"] });
      return;
    }
    if (!data.neverExpires && data.expiryYear !== null && data.expiryMonth !== null) {
      const issue = data.issueYear * 12 + data.issueMonth;
      const expiry = data.expiryYear * 12 + data.expiryMonth;
      if (expiry < issue) {
        ctx.addIssue({ code: "custom", message: "validation.dateOrder", path: ["expiryMonth"] });
      }
    }
  });

export const certificationItemDraftSchema = z.object({
  nameAr: z.string().optional(),
  nameEn: z.string().optional(),
  issuerAr: z.string().optional(),
  issuerEn: z.string().optional(),
  issueMonth: z.number().int().min(1).max(12).nullable().optional(),
  issueYear: z.number().int().nullable().optional(),
  neverExpires: z.boolean().optional(),
  expiryMonth: z.number().int().min(1).max(12).nullable().optional(),
  expiryYear: z.number().int().nullable().optional(),
  credentialId: z.string().optional(),
  verificationUrl: z.string().optional(),
});

export type CertificationItemInput = z.infer<typeof certificationItemSchema>;
export type CertificationItemDraftInput = z.infer<typeof certificationItemDraftSchema>;

export const EMPTY_CERTIFICATION_ITEM: CertificationItemDraftInput = {
  nameAr: "",
  nameEn: "",
  issuerAr: "",
  issuerEn: "",
  issueMonth: null,
  issueYear: null,
  neverExpires: false,
  expiryMonth: null,
  expiryYear: null,
  credentialId: "",
  verificationUrl: "",
};
