export const AUTH_COOKIE_NAME = "seera_session";

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_REQUEST_LIMIT = 3;
export const OTP_REQUEST_WINDOW_MINUTES = 10;

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Short-lived token letting Puppeteer load /print without a session cookie. */
export const EXPORT_TOKEN_TTL_SECONDS = 120;

/** How long a signed PDF download URL stays valid, per PROJECT-BRIEF §6.3. */
export const SIGNED_PDF_URL_TTL_SECONDS = 15 * 60;

/** PDF export rate limit — Puppeteer runs are expensive, per CLAUDE.md §1.6. */
export const PDF_EXPORT_RATE_LIMIT = 5;
export const PDF_EXPORT_RATE_WINDOW_MINUTES = 10;
