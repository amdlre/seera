import { z } from "zod";

export const updateResumeAsAdminSchema = z.object({
  resumeId: z.string().uuid(),
  title: z.string().min(1, { message: "validation.required" }).optional(),
  status: z.enum(["draft", "completed"]).optional(),
});

export const deleteResumeAsAdminSchema = z.object({
  resumeId: z.string().uuid(),
  confirmation: z.literal("حذف", { message: "validation.deleteConfirmation" }),
});

export const bulkDeleteResumesSchema = z.object({
  resumeIds: z.array(z.string().uuid()).min(1),
  confirmation: z.literal("حذف", { message: "validation.deleteConfirmation" }),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["user", "admin"]),
});

export const setUserDisabledSchema = z.object({
  userId: z.string().uuid(),
  disabled: z.boolean(),
});
