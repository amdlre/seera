import { buildOtpEmail } from "@/lib/mail/otp-email";
import { sendMail } from "@/lib/mail/send-mail";
import type { AppLocale } from "@/i18n/routing";

/**
 * Sends a one-time sign-in code to the given address in the requested locale.
 * Returns once the mail provider has accepted the message for delivery.
 */
export async function sendOtpEmail(params: {
  to: string;
  code: string;
  locale: AppLocale;
}): Promise<void> {
  const { subject, text, html } = buildOtpEmail(params.code, params.locale);
  await sendMail({ to: params.to, subject, text, html });
}
