import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Minimal admin shell for Phase 2, proving the two-layer defense: the proxy
 * (middleware) blocks non-admins from this path, and this page independently
 * re-checks the role via requireAdmin(). Full stats/tables land in Phase 8.
 */
export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdmin();
  const t = await getTranslations("admin");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <p className="text-muted-foreground text-sm">{t("subtitle", { email: session.email })}</p>
    </main>
  );
}
