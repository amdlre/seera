import { OTP_EXPIRY_MINUTES } from "@/lib/constants/auth";
import { EMAIL_THEME } from "@/lib/constants/mail";
import type { AppLocale } from "@/i18n/routing";

type OtpCopy = {
  subject: string;
  preheader: string;
  heading: string;
  intro: string;
  codeLabel: string;
  validity: string;
  ignore: string;
  footer: string;
};

const COPY: Record<AppLocale, OtpCopy> = {
  ar: {
    subject: "رمز الدخول إلى سِيرة",
    preheader: `رمزك صالح لمدة ${OTP_EXPIRY_MINUTES} دقائق`,
    heading: "رمز الدخول",
    intro: "استخدم هذا الرمز لإكمال تسجيل الدخول إلى حسابك في سِيرة.",
    codeLabel: "رمز الدخول",
    validity: `الرمز صالح لمدة ${OTP_EXPIRY_MINUTES} دقائق فقط.`,
    ignore: "إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة ولن يتغيّر شيء في حسابك.",
    footer: "سِيرة — منصّة بناء سيرة ذاتية تجتاز أنظمة ATS",
  },
  en: {
    subject: "Your Seera sign-in code",
    preheader: `Your code is valid for ${OTP_EXPIRY_MINUTES} minutes`,
    heading: "Sign-in code",
    intro: "Use this code to finish signing in to your Seera account.",
    codeLabel: "Sign-in code",
    validity: `This code is valid for ${OTP_EXPIRY_MINUTES} minutes only.`,
    ignore: "If you didn't request this code, ignore this email — nothing will change.",
    footer: "Seera — ATS-friendly resume builder",
  },
};

/** Escapes the few characters that could break out of the surrounding markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Builds the OTP email in both parts: an HTML body for normal mail clients and
 * a plain-text fallback for clients that refuse HTML.
 */
export function buildOtpEmail(
  code: string,
  locale: AppLocale,
): { subject: string; text: string; html: string } {
  const copy = COPY[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontStack =
    locale === "ar"
      ? "'Segoe UI', Tahoma, Arial, sans-serif"
      : "'Segoe UI', Helvetica, Arial, sans-serif";
  const t = EMAIL_THEME;

  const text = [copy.heading, "", copy.intro, "", code, "", copy.validity, copy.ignore].join("\n");

  // Table layout + inline styles: the only markup Gmail/Outlook render reliably.
  const html = `<!doctype html>
<html lang="${locale}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(copy.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${t.surface};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(copy.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${t.surface};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="${dir}" style="max-width:480px;background-color:${t.background};border:1px solid ${t.border};border-radius:16px;font-family:${fontStack};">
        <tr>
          <td style="padding:32px 32px 8px;text-align:center;">
            <span style="font-size:22px;font-weight:700;color:${t.primary};letter-spacing:-0.5px;">${locale === "ar" ? "سِيرة" : "Seera"}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 0;text-align:${dir === "rtl" ? "right" : "left"};">
            <h1 style="margin:0 0 8px;font-size:20px;line-height:1.4;color:${t.foreground};">${escapeHtml(copy.heading)}</h1>
            <p style="margin:0;font-size:15px;line-height:1.7;color:${t.mutedForeground};">${escapeHtml(copy.intro)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${t.surface};border:1px solid ${t.border};border-radius:12px;">
              <tr>
                <td align="center" style="padding:20px 16px;">
                  <div style="font-size:12px;color:${t.mutedForeground};margin-bottom:8px;">${escapeHtml(copy.codeLabel)}</div>
                  <div dir="ltr" style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:${t.primary};">${escapeHtml(code)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 8px;text-align:${dir === "rtl" ? "right" : "left"};">
            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:${t.foreground};">${escapeHtml(copy.validity)}</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:${t.mutedForeground};">${escapeHtml(copy.ignore)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 28px;border-top:1px solid ${t.border};text-align:center;">
            <p style="margin:16px 0 0;font-size:12px;color:${t.mutedForeground};">${escapeHtml(copy.footer)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject: copy.subject, text, html };
}
