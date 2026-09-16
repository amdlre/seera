import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlreadySignedIn } from "@/components/auth/already-signed-in";
import { AuthBrand } from "@/components/auth/auth-brand";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/session";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.login");
  const session = await getSession();

  if (session) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24">
        <AuthBrand />
        <AlreadySignedIn email={session.email} role={session.role} />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24">
      <AuthBrand />
      <div className="flex max-w-sm flex-col gap-2 text-center">
        <h1 className="text-foreground text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>
      <LoginForm />
    </main>
  );
}
