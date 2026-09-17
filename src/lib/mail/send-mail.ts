import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";
import { MailDeliveryError } from "@/lib/errors";
import { MAIL_SEND_TIMEOUT_MS, SNDR_SEND_URL } from "@/lib/constants/mail";

export type OutgoingMail = { to: string; subject: string; text: string };

let smtpTransporter: Transporter | undefined;

function getSmtpTransporter(): Transporter {
  smtpTransporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    connectionTimeout: MAIL_SEND_TIMEOUT_MS,
  });
  return smtpTransporter;
}

async function sendViaSmtp(mail: OutgoingMail): Promise<void> {
  await getSmtpTransporter().sendMail({ from: env.MAIL_FROM, ...mail });
}

/** Extracts SNDR's `{ error: { code, message } }` body into one line, if present. */
function describeSndrFailure(status: number, body: unknown): string {
  if (body && typeof body === "object" && "error" in body) {
    const detail = body.error;
    if (detail && typeof detail === "object" && "message" in detail) {
      const code = "code" in detail ? String(detail.code) : "unknown";
      return `SNDR ${status} ${code}: ${String(detail.message)}`;
    }
  }
  return `SNDR ${status}`;
}

async function sendViaSndr(mail: OutgoingMail): Promise<void> {
  const response = await fetch(SNDR_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SNDR_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
    }),
    signal: AbortSignal.timeout(MAIL_SEND_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new MailDeliveryError(describeSndrFailure(response.status, body));
  }
}

/**
 * Sends a plain-text email through the provider selected by MAIL_PROVIDER.
 * Resolves once the provider accepted the message; throws otherwise.
 */
export async function sendMail(mail: OutgoingMail): Promise<void> {
  if (env.MAIL_PROVIDER === "sndr") {
    await sendViaSndr(mail);
    return;
  }
  await sendViaSmtp(mail);
}
