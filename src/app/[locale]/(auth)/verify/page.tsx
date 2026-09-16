import { redirect } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlreadySignedIn } from "@/components/auth/already-signed-in";
import { AuthBrand } from "@/components/auth/auth-brand";
import { VerifyForm } from "@/components/auth/verify-form";
import type { AppLocale } from "@/i18n/routing";
import { getSession } from "@/lib/auth/session";

type VerifyPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyPage({ params, searchParams }: VerifyPageProps) {
  const { locale } = await params;
  const { email } = await searchParams;
  setRequestLocale(locale);

  if (!email) {
    redirect({ href: "/login", locale: locale as AppLocale });
  }

  const session = await getSession();
  if (session) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24">
        <AuthBrand />
        <AlreadySignedIn email={session.email} role={session.role} />
      </main>
    );
  }

  const t = await getTranslations("auth.verify");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24">
      <AuthBrand />
      <div className="flex max-w-sm flex-col gap-2 text-center">
        <h1 className="text-foreground text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle", { email: email ?? "" })}</p>
      </div>
      <VerifyForm email={email ?? ""} />
    </main>
  );
}
