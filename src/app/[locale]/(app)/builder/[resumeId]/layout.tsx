import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { BuilderChrome } from "@/components/builder/builder-chrome";
import type { PreviewItem } from "@/components/builder/builder-preview-context";
import { requireAuth } from "@/lib/auth/session";
import { getResumeForBuilder } from "@/server/services/resume.service";

type BuilderLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string; resumeId: string }>;
};

export default async function BuilderLayout({ children, params }: BuilderLayoutProps) {
  const { locale, resumeId } = await params;
  setRequestLocale(locale);
  const session = await requireAuth();

  const result = await getResumeForBuilder(resumeId, session.sub);
  if (!result.ok) {
    notFound();
  }

  const initialItemsBySectionId: Record<string, PreviewItem[]> = {};
  for (const [sectionId, items] of Object.entries(result.value.itemsBySectionId)) {
    initialItemsBySectionId[sectionId] = items.map((item) => ({
      id: item.id,
      data: item.data as Record<string, unknown>,
    }));
  }

  return (
    <BuilderChrome
      resumeId={resumeId}
      sections={result.value.sections}
      initialPersonalInfo={result.value.personalInfo}
      initialSummary={result.value.summary}
      initialItemsBySectionId={initialItemsBySectionId}
    >
      {children}
    </BuilderChrome>
  );
}
