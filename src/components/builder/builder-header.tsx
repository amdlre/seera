"use client";

import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Logo } from "@/components/shared/logo";
import { BuilderExitButton } from "./builder-exit-button";
import { StepProgress } from "./step-progress";

/** Fixed builder header: exit control, brand, locale toggle, and step progress. */
export function BuilderHeader({ resumeId }: { resumeId: string }) {
  return (
    <header className="border-border bg-background sticky top-0 z-40 border-b">
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <BuilderExitButton />
        <Logo showWordmark={false} />
        <LocaleSwitcher />
      </div>
      <StepProgress resumeId={resumeId} />
    </header>
  );
}
