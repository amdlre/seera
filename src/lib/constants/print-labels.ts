/**
 * Static bilingual labels for the /print page only. This route is
 * intentionally outside the [locale] tree (PROJECT-BRIEF §6 uses a `?lang=`
 * query param, not app-wide locale routing), so it can't use next-intl —
 * hence this small standalone dictionary instead of `useTranslations()`.
 */
export const PRINT_LABELS = {
  ar: {
    present: "الآن",
    neverExpires: "لا تنتهي",
    credentialId: "رقم الاعتماد",
    verificationLink: "رابط التحقق",
    gpaOutOf: "المعدل",
    languageLevels: {
      native: "اللغة الأم",
      advanced: "متقدم",
      intermediate: "متوسط",
      basic: "مبتدئ",
    },
  },
  en: {
    present: "Present",
    neverExpires: "Never expires",
    credentialId: "Credential ID",
    verificationLink: "Verification link",
    gpaOutOf: "GPA",
    languageLevels: {
      native: "Native",
      advanced: "Advanced",
      intermediate: "Intermediate",
      basic: "Basic",
    },
  },
} as const;

export type PrintLang = keyof typeof PRINT_LABELS;
