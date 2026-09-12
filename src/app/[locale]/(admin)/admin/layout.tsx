import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LogoutButton } from "@/components/auth/logout-button";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";

type AdminSectionLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminSectionLayout({ children, params }: AdminSectionLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const t = await getTranslations("admin");

  return (
    <div className="flex min-h-svh">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-background sticky top-0 z-40 flex items-center justify-between gap-3 border-b px-6 py-3">
          <div className="flex items-center gap-2.5">
            <Logo />
            <Badge variant="secondary">{t("badge")}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LocaleSwitcher />
            <LogoutButton />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
