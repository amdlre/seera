import { z } from "zod";

export const requestOtpSchema = z.object({
  email: z
    .string()
    .min(1, { message: "validation.required" })
    .email({ message: "validation.email" }),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .min(1, { message: "validation.required" })
    .email({ message: "validation.email" }),
  code: z
    .string()
    .min(1, { message: "validation.required" })
    .regex(/^\d{6}$/, { message: "validation.otpFormat" }),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
