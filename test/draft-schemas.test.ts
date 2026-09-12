import { describe, expect, it } from "vitest";
import {
  personalInfoDraftSchema,
  personalInfoSchema,
} from "@/lib/validations/resume/personal-info";
import { summaryDraftSchema, summarySchema } from "@/lib/validations/resume/summary";

/**
 * Autosave posts the whole form on every keystroke, so untouched fields arrive
 * as "" and in-progress ones are half-typed. Draft schemas must accept both, or
 * autosave fails silently on every new resume.
 */
describe("draft schemas accept in-progress input", () => {
  const EMPTY_PERSONAL_FORM = {
    fullNameAr: "",
    fullNameEn: "",
    targetJobTitleAr: "",
    targetJobTitleEn: "",
    email: "",
    phone: "",
    cityCountryAr: "",
    cityCountryEn: "",
    linkedin: "",
    portfolioUrl: "",
  };

  it("accepts a completely empty personal-info form", () => {
    expect(personalInfoDraftSchema.safeParse(EMPTY_PERSONAL_FORM).success).toBe(true);
  });

  it("accepts a personal-info form with only a name and a half-typed email", () => {
    const result = personalInfoDraftSchema.safeParse({
      ...EMPTY_PERSONAL_FORM,
      fullNameAr: "باسل ال ظفره",
      email: "basilaldhafrah@gm",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a partially typed phone number", () => {
    const result = personalInfoDraftSchema.safeParse({ ...EMPTY_PERSONAL_FORM, phone: "+9665" });
    expect(result.success).toBe(true);
  });

  it("accepts a summary with only one language filled in", () => {
    expect(summaryDraftSchema.safeParse({ summaryAr: "نص تجريبي", summaryEn: "" }).success).toBe(
      true,
    );
  });

  it("still rejects text beyond the storage cap", () => {
    const tooLong = "x".repeat(601);
    expect(summaryDraftSchema.safeParse({ summaryAr: tooLong, summaryEn: "" }).success).toBe(false);
  });
});

describe("strict schemas still enforce the real rules", () => {
  it("rejects an empty personal-info form", () => {
    expect(personalInfoSchema.safeParse({ fullNameAr: "", email: "" }).success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const result = personalInfoSchema.safeParse({
      fullNameAr: "باسل",
      fullNameEn: "Basil",
      targetJobTitleAr: "مطوّر",
      targetJobTitleEn: "Developer",
      email: "not-an-email",
      phone: "+966500000000",
      cityCountryAr: "الرياض، السعودية",
      cityCountryEn: "Riyadh, Saudi Arabia",
      linkedin: "",
      portfolioUrl: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty summary", () => {
    expect(summarySchema.safeParse({ summaryAr: "", summaryEn: "" }).success).toBe(false);
  });
});
