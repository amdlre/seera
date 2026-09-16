import { LayoutDashboard } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { SessionPayload } from "@/lib/auth/jwt";
import { homePathForRole } from "@/lib/auth/home-path";

/** Public header. A signed-in visitor gets a link to their own space instead of "Sign in". */
export async function SiteHeader({ session }: { session: SessionPayload | null }) {
  const t = await getTranslations("marketing");

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 flex items-center justify-between border-b px-6 py-3 backdrop-blur">
      <Link href="/" aria-label="سِيرة">
        <Logo />
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <LocaleSwitcher />
        {session ? (
          <Button asChild size="sm" className="gap-1.5">
            <Link href={homePathForRole(session.role)}>
              <LayoutDashboard className="size-4" aria-hidden="true" />
              {session.role === "admin" ? t("goToAdmin") : t("goToDashboard")}
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href="/login">{t("ctaSecondary")}</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
