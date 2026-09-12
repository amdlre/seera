/** Axis weights, out of 100 total — ATS-CRITERIA.md §4. */
export const ATS_AXIS_WEIGHTS = {
  completeness: 30,
  dates: 20,
  writingQuality: 25,
  keywords: 15,
  technical: 10,
} as const;

export const ATS_SCORE_THRESHOLDS = {
  red: 60,
  amber: 80,
} as const;

export const MAX_UNEXPLAINED_GAP_MONTHS = 6;
export const MIN_BULLETS_PER_EXPERIENCE = 3;
export const MAX_BULLETS_PER_EXPERIENCE = 5;
export const MIN_BULLET_WORDS = 8;
export const MAX_BULLET_WORDS = 30;

/** Strong past-tense action verbs recommended by ATS-CRITERIA.md §3.3. */
export const STRONG_VERBS_AR = [
  "طوّرت",
  "طورت",
  "صمّمت",
  "صممت",
  "قدت",
  "أطلقت",
  "حسّنت",
  "حسنت",
  "خفّضت",
  "خفضت",
  "رفعت",
  "أتمتت",
  "دمجت",
  "أدرت",
  "دربت",
  "بنيت",
  "أنشأت",
  "نفّذت",
  "نفذت",
];

export const STRONG_VERBS_EN = [
  "developed",
  "designed",
  "led",
  "launched",
  "improved",
  "reduced",
  "increased",
  "automated",
  "integrated",
  "managed",
  "migrated",
  "built",
  "created",
  "implemented",
  "delivered",
];

/** Overused, low-signal phrases the writing-quality check flags. */
export const WEAK_PHRASES_AR = ["مسؤول عن", "مسؤولة عن", "كنت مسؤولًا"];
export const WEAK_PHRASES_EN = ["responsible for", "in charge of", "duties included"];

export const FIRST_PERSON_PRONOUNS_AR = ["أنا "];
export const FIRST_PERSON_PRONOUNS_EN = [" i ", " i'm ", " i've "];

/** Eastern Arabic-Indic digits — ATS-CRITERIA.md §4 forbids these everywhere. */
export const EASTERN_ARABIC_DIGITS = /[٠-٩]/;

/** A conservative emoji/decorative-symbol detector for the technical-compatibility check. */
export const EMOJI_OR_DECORATIVE_SYMBOL = /[←-⇿☀-➿\u{1F300}-\u{1FAFF}✓★➤]/u;
