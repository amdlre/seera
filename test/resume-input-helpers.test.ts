import { describe, expect, it } from "vitest";
import { hasJobTitleMismatch } from "@/lib/resume/job-title-match";
import { formatPhoneInternational } from "@/lib/resume/phone";
import { findDuplicateTags, parseTags, serializeTags } from "@/lib/resume/tags";
import { experienceItemSchema } from "@/lib/validations/resume/experience";
import { normalizeEnglishCommas } from "@/lib/validations/resume/english-text";

describe("formatPhoneInternational", () => {
  it.each([
    ["0530435697", "+966 53 043 5697"],
    ["053 043 5697", "+966 53 043 5697"],
    ["530435697", "+966 53 043 5697"],
    ["966530435697", "+966 53 043 5697"],
    ["00966530435697", "+966 53 043 5697"],
    ["+966 530435697", "+966 53 043 5697"],
    ["٠٥٣٠٤٣٥٦٩٧", "+966 53 043 5697"],
    ["053-043-5697", "+966 53 043 5697"],
  ])("rewrites %s as %s", (input, expected) => {
    expect(formatPhoneInternational(input)).toBe(expected);
  });

  it("leaves non-Saudi and incomplete numbers untouched", () => {
    expect(formatPhoneInternational("+44 20 7946 0958")).toBe("+44 20 7946 0958");
    expect(formatPhoneInternational("0530")).toBe("0530");
    expect(formatPhoneInternational("")).toBe("");
  });
});

describe("hasJobTitleMismatch", () => {
  it("flags titles that describe different roles", () => {
    expect(hasJobTitleMismatch("مطوّر واجهات أمامية", "Full Stack Developer")).toBe(true);
    expect(hasJobTitleMismatch("محاسب", "Frontend Developer")).toBe(true);
  });

  it("accepts matching translations", () => {
    expect(hasJobTitleMismatch("مطوّر واجهات أمامية", "Frontend Developer")).toBe(false);
    expect(
      hasJobTitleMismatch("مطور واجهات أمامية وقائد فريق", "Front-End Developer & Team Lead"),
    ).toBe(false);
    expect(hasJobTitleMismatch("مطوّر فل ستاك", "Full-Stack Engineer")).toBe(false);
  });

  it("never flags a title it doesn't recognise, or a missing one", () => {
    expect(hasJobTitleMismatch("مهندس برمجيات", "Software Engineer")).toBe(false);
    expect(hasJobTitleMismatch("", "Frontend Developer")).toBe(false);
  });
});

describe("skill tags", () => {
  it("parses Latin and Arabic separators and drops duplicates", () => {
    expect(parseTags("React, Next.js، TypeScript; react ,  ")).toEqual([
      "React",
      "Next.js",
      "TypeScript",
    ]);
    expect(serializeTags(["React", "Next.js"])).toBe("React, Next.js");
  });

  it("finds skills repeated across categories, case-insensitively", () => {
    expect(findDuplicateTags([["React", "Vue"], ["react", "Docker"], ["Docker"]])).toEqual([
      "React",
      "Docker",
    ]);
    expect(findDuplicateTags([["React", "React"], ["Vue"]])).toEqual([]);
  });
});

describe("English city/country field", () => {
  const VALID_EXPERIENCE = {
    titleAr: "مطوّر",
    titleEn: "Developer",
    companyAr: "شركة",
    companyEn: "Company",
    cityCountryAr: "الرياض، السعودية",
    cityCountryEn: "Riyadh, Saudi Arabia",
    employmentType: "full_time",
    startMonth: 1,
    startYear: 2024,
    endMonth: null,
    endYear: null,
    isCurrent: true,
    bulletsAr: ["نقطة"],
    bulletsEn: ["Bullet"],
  };

  it("rejects the Arabic comma and Arabic text", () => {
    for (const cityCountryEn of ["Riyadh، Saudi Arabia", "الرياض، السعودية"]) {
      const result = experienceItemSchema.safeParse({ ...VALID_EXPERIENCE, cityCountryEn });
      expect(result.success).toBe(false);
    }
    expect(experienceItemSchema.safeParse(VALID_EXPERIENCE).success).toBe(true);
  });

  it("offers a comma fix", () => {
    expect(normalizeEnglishCommas("Riyadh ، Saudi Arabia")).toBe("Riyadh, Saudi Arabia");
  });
});
