"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { logoutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

export function LogoutButton({ className }: { className?: string }) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onLogout() {
    startTransition(async () => {
      await logoutAction();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <Button variant="outline" className={className} onClick={onLogout} disabled={isPending}>
      {t("logout")}
    </Button>
  );
}
