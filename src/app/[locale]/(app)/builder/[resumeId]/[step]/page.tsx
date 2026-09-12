import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CertificationsForm } from "@/components/builder/certifications-form";
import { CustomSectionsForm } from "@/components/builder/custom-sections-form";
import { EducationForm } from "@/components/builder/education-form";
import { ExperienceForm } from "@/components/builder/experience-form";
import { LanguagesForm } from "@/components/builder/languages-form";
import { PersonalInfoForm } from "@/components/builder/personal-info-form";
import { SkillsForm } from "@/components/builder/skills-form";
import { SummaryForm } from "@/components/builder/summary-form";

type BuilderStepPageProps = {
  params: Promise<{ locale: string; resumeId: string; step: string }>;
};

export default async function BuilderStepPage({ params }: BuilderStepPageProps) {
  const { locale, resumeId, step } = await params;
  setRequestLocale(locale);

  switch (step) {
    case "personal":
      return <PersonalInfoForm resumeId={resumeId} />;
    case "summary":
      return <SummaryForm resumeId={resumeId} />;
    case "experience":
      return <ExperienceForm />;
    case "education":
      return <EducationForm />;
    case "skills":
      return <SkillsForm />;
    case "certifications":
      return <CertificationsForm />;
    case "languages":
      return <LanguagesForm />;
    case "custom":
      return <CustomSectionsForm resumeId={resumeId} />;
    default:
      notFound();
  }
}
