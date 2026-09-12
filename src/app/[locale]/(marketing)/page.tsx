import { FileCheck2, Languages, ShieldCheck, Sparkles } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/shared/site-header";
import { Link } from "@/i18n/navigation";

const FEATURE_ICONS = [FileCheck2, Languages, Sparkles, ShieldCheck] as const;

export default async function MarketingHomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("marketing");

  const features = [0, 1, 2, 3].map((index) => ({
    Icon: FEATURE_ICONS[index],
    title: t(`features.${index}.title`),
    description: t(`features.${index}.description`),
  }));

  const steps = [0, 1, 2].map((index) => ({
    title: t(`steps.${index}.title`),
    description: t(`steps.${index}.description`),
  }));

  return (
    <>
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center px-6 py-24 text-center">
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
        </section>

        <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ Icon, title, description }) => (
            <div key={title} className="border-border flex flex-col gap-3 rounded-lg border p-6">
              <Icon className="text-primary size-6" aria-hidden="true" />
              <h3 className="text-foreground font-medium">{title}</h3>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          ))}
        </section>

        <section className="bg-muted/40 px-6 py-16">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
            <h2 className="text-foreground text-center text-2xl font-semibold">
              {t("howItWorksTitle")}
            </h2>
            <ol className="flex flex-col gap-6">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-foreground font-medium">{step.title}</p>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="text-foreground text-2xl font-semibold">{t("finalCtaTitle")}</h2>
          <Button asChild size="lg">
            <Link href="/login">{t("cta")}</Link>
          </Button>
        </section>
      </main>

      <footer className="border-border text-muted-foreground border-t px-6 py-8 text-center text-sm">
        {t("footer", { year: new Date().getFullYear() })}
      </footer>
    </>
  );
}
