/** Saudi Arabia's international dialing code — the default for local numbers. */
export const SAUDI_COUNTRY_CODE = "966";

/** A Saudi mobile written locally: 05XXXXXXXX (10 digits) or 5XXXXXXXX (9 digits). */
export const SAUDI_LOCAL_MOBILE = /^0?(5\d{8})$/;

/** A Saudi mobile already carrying the country code: 9665XXXXXXXX or 009665XXXXXXXX. */
export const SAUDI_INTERNATIONAL_MOBILE = /^(?:00)?966(5\d{8})$/;

/** Accepted international phone shape for ATS: "+" followed by digits and spaces. */
export const INTERNATIONAL_PHONE_FORMAT = /^\+\d[\d ]{7,}$/;
