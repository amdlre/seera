"use client";

import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { useBuilderPreview } from "./builder-preview-context";

function monthYearLabel(month: unknown, year: unknown, isCurrent: unknown, nowLabel: string): string {
  if (isCurrent) return nowLabel;
  if (!month || !year) return "";
  return `${String(month).padStart(2, "0")}/${year}`;
}

/**
 * Simplified live preview of the resume content entered so far. Replaced by
 * the exact ATS one-column print template in Phase 5.
 */
export function ResumePreviewContent() {
  const { personalInfo, summary, sections, itemsBySectionId } = useBuilderPreview();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("builder.preview");
  const tCommon = useTranslations("builder.common");
  const tLanguages = useTranslations("builder.languages");
  const nowLabel = tCommon("now");

  const fullName = locale === "ar" ? personalInfo.fullNameAr : personalInfo.fullNameEn;
  const jobTitle = locale === "ar" ? personalInfo.targetJobTitleAr : personalInfo.targetJobTitleEn;
  const cityCountry = locale === "ar" ? personalInfo.cityCountryAr : personalInfo.cityCountryEn;
  const summaryText = locale === "ar" ? summary.summaryAr : summary.summaryEn;
  const contactLine = [personalInfo.email, personalInfo.phone, cityCountry].filter(Boolean).join(" | ");

  const experienceSection = sections.find((section) => section.type === "experience");
  const experienceItems = experienceSection ? (itemsBySectionId[experienceSection.id] ?? []) : [];

  const educationSection = sections.find((section) => section.type === "education");
  const educationItems = educationSection ? (itemsBySectionId[educationSection.id] ?? []) : [];

  const skillsSection = sections.find((section) => section.type === "skills");
  const skillsItems = skillsSection ? (itemsBySectionId[skillsSection.id] ?? []) : [];

  const certificationsSection = sections.find((section) => section.type === "certifications");
  const certificationsItems = certificationsSection
    ? (itemsBySectionId[certificationsSection.id] ?? [])
    : [];

  const languagesSection = sections.find((section) => section.type === "languages");
  const languagesItems = languagesSection ? (itemsBySectionId[languagesSection.id] ?? []) : [];

  const hasContent =
    fullName ||
    jobTitle ||
    summaryText ||
    experienceItems.length > 0 ||
    educationItems.length > 0 ||
    skillsItems.length > 0 ||
    certificationsItems.length > 0 ||
    languagesItems.length > 0;

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="border-border bg-background flex flex-col gap-4 rounded-lg border p-4 text-sm"
    >
      {!hasContent && <p className="text-muted-foreground">{t("empty")}</p>}
      {fullName && <h3 className="text-foreground text-base font-semibold">{fullName}</h3>}
      {jobTitle && <p className="text-muted-foreground">{jobTitle}</p>}
      {contactLine && <p className="text-muted-foreground text-xs">{contactLine}</p>}

      {summaryText && (
        <section>
          <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t("summaryTitle")}
          </h4>
          <p className="text-foreground mt-1 whitespace-pre-wrap">{summaryText}</p>
        </section>
      )}

      {experienceItems.length > 0 && (
        <section className="flex flex-col gap-2">
          <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t("experienceTitle")}
          </h4>
          {experienceItems.map((item) => {
            const data = item.data as Record<string, unknown>;
            const title = locale === "ar" ? data.titleAr : data.titleEn;
            const bullets = (locale === "ar" ? data.bulletsAr : data.bulletsEn) as
              | string[]
              | undefined;
            return (
              <div key={item.id}>
                <p className="text-foreground font-medium">
                  {String(title ?? "")} — {String(data.company ?? "")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {monthYearLabel(data.startMonth, data.startYear, false, nowLabel)} –{" "}
                  {monthYearLabel(data.endMonth, data.endYear, data.isCurrent, nowLabel)}
                </p>
                <ul className="mt-1 list-disc ps-4">
                  {bullets?.filter(Boolean).map((bullet, index) => <li key={index}>{bullet}</li>)}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      {educationItems.length > 0 && (
        <section className="flex flex-col gap-2">
          <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t("educationTitle")}
          </h4>
          {educationItems.map((item) => {
            const data = item.data as Record<string, unknown>;
            const degree = locale === "ar" ? data.degreeAr : data.degreeEn;
            const university = locale === "ar" ? data.universityAr : data.universityEn;
            return (
              <div key={item.id}>
                <p className="text-foreground font-medium">{String(degree ?? "")}</p>
                <p className="text-muted-foreground text-xs">
                  {String(university ?? "")} · {String(data.graduationYear ?? "")}
                </p>
              </div>
            );
          })}
        </section>
      )}

      {skillsItems.length > 0 && (
        <section className="flex flex-col gap-1">
          <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t("skillsTitle")}
          </h4>
          {skillsItems.map((item) => {
            const data = item.data as Record<string, unknown>;
            const category = locale === "ar" ? data.categoryAr : data.categoryEn;
            const skills = locale === "ar" ? data.skillsAr : data.skillsEn;
            return (
              <p key={item.id} className="text-foreground text-xs">
                <span className="font-medium">{String(category ?? "")}:</span> {String(skills ?? "")}
              </p>
            );
          })}
        </section>
      )}

      {certificationsItems.length > 0 && (
        <section className="flex flex-col gap-1">
          <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t("certificationsTitle")}
          </h4>
          {certificationsItems.map((item) => {
            const data = item.data as Record<string, unknown>;
            const name = locale === "ar" ? data.nameAr : data.nameEn;
            const issuer = locale === "ar" ? data.issuerAr : data.issuerEn;
            return (
              <p key={item.id} className="text-foreground text-xs">
                {String(name ?? "")} — {String(issuer ?? "")}
              </p>
            );
          })}
        </section>
      )}

      {languagesItems.length > 0 && (
        <section className="flex flex-col gap-1">
          <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t("languagesTitle")}
          </h4>
          <p className="text-foreground text-xs">
            {languagesItems
              .map((item) => {
                const data = item.data as Record<string, unknown>;
                const name = locale === "ar" ? data.languageAr : data.languageEn;
                return `${String(name ?? "")} (${tLanguages(`levels.${String(data.level)}`)})`;
              })
              .join(" | ")}
          </p>
        </section>
      )}
    </div>
  );
}
