/** Supported outbound mail transports. `smtp` is for local Mailhog; `sndr` is production. */
export const MAIL_PROVIDERS = ["smtp", "sndr"] as const;
export type MailProvider = (typeof MAIL_PROVIDERS)[number];

export const SNDR_SEND_URL = "https://api.sndr.sh/v1/send";

/** Upper bound for a single send request before we give up and surface an error. */
export const MAIL_SEND_TIMEOUT_MS = 10_000;

/**
 * Email clients don't support CSS variables or oklch(), so the brand tokens
 * from globals.css are mirrored here as plain hex.
 */
export const EMAIL_THEME = {
  primary: "#165DFC",
  foreground: "#0F172B",
  mutedForeground: "#62748E",
  border: "#E2E8F0",
  surface: "#F8FAFC",
  background: "#FFFFFF",
} as const;
