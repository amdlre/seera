import { describe, expect, it } from "vitest";
import { calculateAtsScore } from "@/lib/ats/score";
import type { AtsScoreInput } from "@/lib/ats/types";
import type { ResumeSection } from "@/db/schema";

function makeSection(type: string, sortOrder: number): ResumeSection {
  return {
    id: `section-${type}`,
    resumeId: "resume-1",
    type: type as ResumeSection["type"],
    titleAr: type,
    titleEn: type,
    layout: "paragraph",
    sortOrder,
    isVisible: true,
    isCustom: false,
  };
}

const SECTIONS = [
  makeSection("personal", 0),
  makeSection("summary", 1),
  makeSection("experience", 2),
  makeSection("education", 3),
  makeSection("skills", 4),
];

const WELL_FILLED_INPUT: AtsScoreInput = {
  personalInfo: {
    fullNameAr: "باسل محمد",
    fullNameEn: "Basil Mohammed",
    targetJobTitleAr: "مطوّر واجهات أمامية",
    targetJobTitleEn: "Frontend Developer",
    email: "basil@seera.dev",
    phone: "+966 50 000 0000",
    cityCountryAr: "الرياض، السعودية",
    cityCountryEn: "Riyadh, Saudi Arabia",
    linkedin: "linkedin.com/in/basil",
    portfolioUrl: "github.com/basil",
  },
  summary: {
    summaryAr:
      "مطوّر واجهات أمامية بخبرة 4 سنوات في بناء تطبيقات ويب باستخدام React وNext.js. قدت إعادة بناء منصة خدمت 50,000 مستخدم.",
    summaryEn:
      "Frontend Developer with 4 years of experience building web applications using React and Next.js. Led the rebuild of a platform serving 50,000 users.",
  },
  sections: SECTIONS,
  itemsBySectionId: {
    "section-experience": [
      {
        id: "exp-1",
        data: {
          titleAr: "مطوّر واجهات أمامية",
          titleEn: "Frontend Developer",
          company: "شركة تقنية",
          cityCountry: "الرياض، السعودية",
          startMonth: 3,
          startYear: 2023,
          endMonth: 8,
          endYear: 2024,
          isCurrent: false,
          bulletsAr: [
            "طوّرت 12 واجهة تفاعلية باستخدام React وTypeScript، ما رفع معدل إتمام الطلبات بنسبة 18%",
            "قدت فريقًا من 3 مطورين لإطلاق ميزة جديدة خلال شهرين وخفّضت زمن التطوير بنسبة 25%",
            "حسّنت أداء الصفحة الرئيسية من 4 ثوانٍ إلى ثانية ونصف عبر تقسيم الشيفرة",
          ],
          bulletsEn: [
            "Developed 12 interactive interfaces using React and TypeScript, raising order completion by 18%",
            "Led a team of 3 developers to launch a new feature within two months, cutting delivery time by 25%",
            "Improved homepage load time from 4s to 1.5s via code splitting",
          ],
        },
      },
    ],
    "section-education": [
      {
        id: "edu-1",
        data: {
          degreeAr: "بكالوريوس علوم الحاسب",
          degreeEn: "B.Sc. in Computer Science",
          majorAr: "علوم الحاسب",
          majorEn: "Computer Science",
          universityAr: "جامعة الملك سعود",
          universityEn: "King Saud University",
          cityCountry: "الرياض، السعودية",
          graduationYear: 2020,
          isExpected: false,
          gpaValue: 4.35,
          gpaScale: 5,
        },
      },
    ],
    "section-skills": [
      {
        id: "skill-1",
        data: {
          categoryAr: "لغات البرمجة",
          categoryEn: "Programming Languages",
          skillsAr: "JavaScript, TypeScript, Python",
          skillsEn: "JavaScript, TypeScript, Python",
        },
      },
    ],
  },
};

const EMPTY_INPUT: AtsScoreInput = {
  personalInfo: {},
  summary: {},
  sections: SECTIONS,
  itemsBySectionId: {},
};

describe("calculateAtsScore", () => {
  it("scores a well-filled resume highly (≥80)", () => {
    const result = calculateAtsScore(WELL_FILLED_INPUT);
    expect(result.total).toBeGreaterThanOrEqual(80);
    expect(result.axes.completeness.earned).toBe(30);
  });

  it("scores an empty resume low and lists the missing sections as issues", () => {
    const result = calculateAtsScore(EMPTY_INPUT);
    expect(result.total).toBeLessThan(60);
    expect(result.issues.some((issue) => issue.id === "completeness-personal")).toBe(true);
    expect(result.issues.some((issue) => issue.id === "completeness-experience")).toBe(true);
  });

  it("clamps the total score between 0 and 100", () => {
    const result = calculateAtsScore(WELL_FILLED_INPUT);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });

  it("matches keywords from a pasted job posting against the resume content", () => {
    const result = calculateAtsScore({
      ...WELL_FILLED_INPUT,
      jobPostingText: "We need a Frontend Developer skilled in React, TypeScript, and GraphQL.",
    });

    expect(result.keywordAnalysis.matched.map((match) => match.id)).toContain("react");
    expect(result.keywordAnalysis.missing.map((match) => match.id)).toContain("graphql");
  });

  it("flags Eastern Arabic-Indic digits as a technical-compatibility issue", () => {
    const result = calculateAtsScore({
      ...WELL_FILLED_INPUT,
      summary: { ...WELL_FILLED_INPUT.summary, summaryAr: "خبرة ١٠ سنوات" },
    });

    expect(result.issues.some((issue) => issue.id === "technical-eastern-digits")).toBe(true);
  });

  it("flags an unexplained gap of more than 6 months between jobs", () => {
    const result = calculateAtsScore({
      ...WELL_FILLED_INPUT,
      itemsBySectionId: {
        ...WELL_FILLED_INPUT.itemsBySectionId,
        "section-experience": [
          ...WELL_FILLED_INPUT.itemsBySectionId["section-experience"],
          {
            id: "exp-2",
            data: {
              ...WELL_FILLED_INPUT.itemsBySectionId["section-experience"][0].data,
              startMonth: 1,
              startYear: 2020,
              endMonth: 6,
              endYear: 2021,
              isCurrent: false,
            },
          },
        ],
      },
    });

    expect(result.issues.some((issue) => issue.id === "dates-gap")).toBe(true);
  });
});
