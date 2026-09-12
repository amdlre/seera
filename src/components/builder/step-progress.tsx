"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ResumeSectionType } from "@/db/schema";
import { Link, usePathname } from "@/i18n/navigation";
import { BUILDER_STEPS } from "@/lib/constants/builder";
import { personalInfoSchema } from "@/lib/validations/resume/personal-info";
import { summarySchema } from "@/lib/validations/resume/summary";
import { cn } from "@/lib/utils";
import { useBuilderPreview } from "./builder-preview-context";

type StepStatus = "empty" | "incomplete" | "complete" | "not-implemented";

const LIST_SECTION_TYPES: Partial<Record<string, ResumeSectionType>> = {
  experience: "experience",
  education: "education",
  skills: "skills",
  certifications: "certifications",
  languages: "languages",
};

function currentStepIdFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "personal";
}

export function StepProgress({ resumeId }: { resumeId: string }) {
  const pathname = usePathname();
  const t = useTranslations("builder.steps");
  const { personalInfo, summary, sections, itemsBySectionId } = useBuilderPreview();
  const currentStepId = currentStepIdFromPathname(pathname);

  function statusFor(stepId: string): StepStatus {
    if (stepId === "personal") {
      if (personalInfoSchema.safeParse(personalInfo).success) return "complete";
      return Object.values(personalInfo).some(Boolean) ? "incomplete" : "empty";
    }
    if (stepId === "summary") {
      if (summarySchema.safeParse(summary).success) return "complete";
      return Object.values(summary).some(Boolean) ? "incomplete" : "empty";
    }

    const listSectionType = LIST_SECTION_TYPES[stepId];
    if (listSectionType) {
      const section = sections.find((candidate) => candidate.type === listSectionType);
      const items = section ? (itemsBySectionId[section.id] ?? []) : [];
      return items.length > 0 ? "complete" : "empty";
    }

    if (stepId === "custom") {
      const hasCustomSections = sections.some((section) => section.isCustom);
      return hasCustomSections ? "complete" : "empty";
    }

    if (stepId === "review") {
      return "empty";
    }

    return "not-implemented";
  }

  return (
    <nav aria-label={t("ariaLabel")} className="border-border overflow-x-auto border-b">
      <ol className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3">
        {BUILDER_STEPS.map((step, index) => {
          const isCurrent = step.id === currentStepId;
          const status = statusFor(step.id);
          const href =
            step.id === "review" ? `/builder/${resumeId}/review` : `/builder/${resumeId}/${step.id}`;

          const badge = (
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                isCurrent && "border-primary bg-primary text-primary-foreground",
                !isCurrent && status === "complete" && "border-primary text-primary",
                !isCurrent && status === "incomplete" && "border-warning text-warning",
                !isCurrent && (status === "empty" || status === "not-implemented") &&
                  "border-border text-muted-foreground",
              )}
            >
              {status === "complete" && !isCurrent ? <Check className="size-3.5" /> : index + 1}
            </span>
          );

          const label = (
            <span
              className={cn(
                "text-xs whitespace-nowrap",
                isCurrent ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              {t(step.titleKey)}
            </span>
          );

          return (
            <li key={step.id} className="flex items-center gap-1.5">
              {step.implemented ? (
                <Link href={href} className="flex items-center gap-1.5">
                  {badge}
                  {label}
                </Link>
              ) : (
                <span className="flex cursor-not-allowed items-center gap-1.5 opacity-40">
                  {badge}
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
