import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function SiteHeader() {
  const t = await getTranslations("marketing");

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 flex items-center justify-between border-b px-6 py-3 backdrop-blur">
      <Link href="/" aria-label="سِيرة">
        <Logo />
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <LocaleSwitcher />
        <Button asChild size="sm" variant="outline">
          <Link href="/login">{t("ctaSecondary")}</Link>
        </Button>
      </div>
    </header>
  );
}
