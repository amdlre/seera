import { getTranslations } from "next-intl/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * Shown instead of the login form when a session already exists, so signing in
 * as somebody else is a deliberate sign-out rather than a silent swap.
 */
export async function AlreadySignedIn({
  email,
  role,
}: {
  email: string;
  role: "user" | "admin";
}) {
  const t = await getTranslations("auth.alreadySignedIn");
  const homeHref = role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="border-border flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border p-6 text-center">
      <div className="flex flex-col gap-1">
        <p className="text-foreground font-medium">{t("title")}</p>
        <p className="text-muted-foreground text-sm">{t("signedInAs", { email })}</p>
      </div>
      <p className="text-muted-foreground text-sm">{t("hint")}</p>
      <div className="flex w-full flex-col gap-2">
        <Button asChild>
          <Link href={homeHref}>{role === "admin" ? t("goToAdmin") : t("goToDashboard")}</Link>
        </Button>
        <LogoutButton className="w-full" />
      </div>
    </div>
  );
}
