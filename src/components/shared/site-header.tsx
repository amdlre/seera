import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function SiteHeader() {
  const t = await getTranslations("marketing");

  return (
    <header className="border-border flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="text-foreground text-lg font-semibold">
        سِيرة
      </Link>
      <div className="flex items-center gap-4">
        <LocaleSwitcher />
        <Button asChild size="sm" variant="outline">
          <Link href="/login">{t("ctaSecondary")}</Link>
        </Button>
      </div>
    </header>
  );
}
