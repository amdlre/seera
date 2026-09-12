import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import { OTP_EXPIRY_MINUTES } from "@/lib/constants/auth";
import type { AppLocale } from "@/i18n/routing";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

function buildOtpEmailContent(code: string, locale: AppLocale): { subject: string; text: string } {
  if (locale === "ar") {
    return {
      subject: "رمز الدخول إلى سِيرة",
      text: `رمز الدخول الخاص بك هو: ${code}\nصالح لمدة ${OTP_EXPIRY_MINUTES} دقائق. إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.`,
    };
  }

  return {
    subject: "Your Seera sign-in code",
    text: `Your sign-in code is: ${code}\nValid for ${OTP_EXPIRY_MINUTES} minutes. If you didn't request this, you can ignore this email.`,
  };
}

/**
 * Sends a one-time sign-in code to the given address in the requested locale.
 * Returns once the SMTP server has accepted the message for delivery.
 */
export async function sendOtpEmail(params: {
  to: string;
  code: string;
  locale: AppLocale;
}): Promise<void> {
  const { subject, text } = buildOtpEmailContent(params.code, params.locale);

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: params.to,
    subject,
    text,
  });
}
