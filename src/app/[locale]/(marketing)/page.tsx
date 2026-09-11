import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

export default async function MarketingHomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("marketing");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Badge variant="secondary" className="mb-6">
        {t("badge")}
      </Badge>
      <h1 className="text-foreground max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        {t("title")}
      </h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-lg">{t("subtitle")}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/login">{t("cta")}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">{t("ctaSecondary")}</Link>
        </Button>
      </div>
    </main>
  );
}
