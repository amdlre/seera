import type { NewResumeSection } from "@/db/schema";

type DefaultSectionBlueprint = Pick<
  NewResumeSection,
  "type" | "titleAr" | "titleEn" | "layout" | "sortOrder"
>;

/** The seven standard sections every new resume starts with, per ATS-CRITERIA.md. */
export const DEFAULT_RESUME_SECTIONS: DefaultSectionBlueprint[] = [
  {
    type: "personal",
    titleAr: "المعلومات الشخصية",
    titleEn: "Contact Information",
    layout: "paragraph",
    sortOrder: 0,
  },
  {
    type: "summary",
    titleAr: "الملخص المهني",
    titleEn: "Professional Summary",
    layout: "paragraph",
    sortOrder: 1,
  },
  {
    type: "experience",
    titleAr: "الخبرات العملية",
    titleEn: "Work Experience",
    layout: "dated_entries",
    sortOrder: 2,
  },
  {
    type: "education",
    titleAr: "التعليم",
    titleEn: "Education",
    layout: "dated_entries",
    sortOrder: 3,
  },
  {
    type: "skills",
    titleAr: "المهارات",
    titleEn: "Skills",
    layout: "bullets",
    sortOrder: 4,
  },
  {
    type: "certifications",
    titleAr: "الشهادات المهنية",
    titleEn: "Certifications",
    layout: "dated_entries",
    sortOrder: 5,
  },
  {
    type: "languages",
    titleAr: "اللغات",
    titleEn: "Languages",
    layout: "bullets",
    sortOrder: 6,
  },
];
