"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { createResumeAction } from "@/actions/resume.actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

export function CreateResumeButton() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onCreate() {
    startTransition(async () => {
      const { resumeId } = await createResumeAction();
      router.push(`/builder/${resumeId}/personal`);
    });
  }

  return (
    <Button onClick={onCreate} disabled={isPending}>
      {isPending ? t("creating") : t("createResume")}
    </Button>
  );
}
