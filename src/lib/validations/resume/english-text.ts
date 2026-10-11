import { z } from "zod";

/** Any Arabic-script letter, or the Arabic comma "،" / semicolon "؛". */
const ARABIC_SCRIPT = /[؀-ۿ]/;

/** True when the text contains Arabic script (letters or Arabic punctuation). */
export function containsArabicScript(value: string): boolean {
  return ARABIC_SCRIPT.test(value);
}

/**
 * A required English location field: rejects Arabic script (including the
 * Arabic comma "،") so the English resume never mixes scripts, e.g. it
 * blocks "الرياض، السعودية" and "Riyadh، Saudi Arabia" in favor of
 * "Riyadh, Saudi Arabia".
 */
export function englishCityCountry() {
  return z
    .string()
    .min(1, { message: "validation.required" })
    .refine((value) => !containsArabicScript(value), { message: "validation.englishCityFormat" });
}

/** Same rule as `englishCityCountry()`, for an optional field (blank allowed). */
export function optionalEnglishCityCountry() {
  return z
    .string()
    .refine((value) => !containsArabicScript(value), { message: "validation.englishCityFormat" })
    .optional()
    .or(z.literal(""));
}

/** True when the value looks like "City, Country" — used for a soft format hint, not a hard rule. */
export function hasCityCountryShape(value: string): boolean {
  return /^[^,]+,\s*[^,]+$/.test(value.trim());
}

/** Swaps Arabic commas for ", " — the one-click fix offered next to the error. */
export function normalizeEnglishCommas(value: string): string {
  return value.replace(/\s*،\s*/g, ", ").trim();
}
