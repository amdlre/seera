import {
  SAUDI_COUNTRY_CODE,
  SAUDI_INTERNATIONAL_MOBILE,
  SAUDI_LOCAL_MOBILE,
} from "@/lib/constants/phone";

const EASTERN_TO_WESTERN_DIGITS: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

function toWesternDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (digit) => EASTERN_TO_WESTERN_DIGITS[digit] ?? digit);
}

function groupSaudiMobile(nineDigits: string): string {
  return `+${SAUDI_COUNTRY_CODE} ${nineDigits.slice(0, 2)} ${nineDigits.slice(2, 5)} ${nineDigits.slice(5)}`;
}

/**
 * Rewrites a Saudi mobile number into the ATS-friendly international form
 * "+966 5X XXX XXXX" (from 05..., 5..., 9665..., 009665..., any spacing,
 * dashes or Eastern Arabic digits). Anything else is returned trimmed, unchanged.
 */
export function formatPhoneInternational(rawPhone: string): string {
  const trimmed = rawPhone.trim();
  const digitsOnly = toWesternDigits(trimmed)
    .replace(/[\s\-().]/g, "")
    .replace(/^\+/, "");
  const localMatch = SAUDI_LOCAL_MOBILE.exec(digitsOnly);
  const internationalMatch = SAUDI_INTERNATIONAL_MOBILE.exec(digitsOnly);
  const nationalNumber = localMatch?.[1] ?? internationalMatch?.[1];
  return nationalNumber ? groupSaudiMobile(nationalNumber) : trimmed;
}
