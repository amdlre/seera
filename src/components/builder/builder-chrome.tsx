"use client";

import type { ReactNode } from "react";
import type { ResumeSection } from "@/db/schema";
import { AutosaveRegistryProvider } from "@/hooks/use-autosave-registry";
import type { PersonalInfoDraftInput } from "@/lib/validations/resume/personal-info";
import type { SummaryDraftInput } from "@/lib/validations/resume/summary";
import { BuilderBottomNav } from "./builder-bottom-nav";
import { BuilderHeader } from "./builder-header";
import { BuilderPreviewProvider, type PreviewItem } from "./builder-preview-context";
import { LivePreviewPanel } from "./live-preview-panel";
import { MobilePreviewSheet } from "./mobile-preview-sheet";

type BuilderChromeProps = {
  resumeId: string;
  sections: ResumeSection[];
  initialPersonalInfo: PersonalInfoDraftInput;
  initialSummary: SummaryDraftInput;
  initialItemsBySectionId: Record<string, PreviewItem[]>;
  children: ReactNode;
};

/** The builder's shared shell: step progress, live preview, and bottom nav. */
export function BuilderChrome({
  resumeId,
  sections,
  initialPersonalInfo,
  initialSummary,
  initialItemsBySectionId,
  children,
}: BuilderChromeProps) {
  return (
    <BuilderPreviewProvider
      sections={sections}
      initialPersonalInfo={initialPersonalInfo}
      initialSummary={initialSummary}
      initialItemsBySectionId={initialItemsBySectionId}
    >
      <AutosaveRegistryProvider>
        <div className="flex min-h-screen flex-col">
          <BuilderHeader resumeId={resumeId} />
          <div className="flex flex-1 flex-col lg:flex-row">
            <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 lg:px-8">{children}</main>
            <LivePreviewPanel />
          </div>
          <MobilePreviewSheet />
          <BuilderBottomNav resumeId={resumeId} />
        </div>
      </AutosaveRegistryProvider>
    </BuilderPreviewProvider>
  );
}
