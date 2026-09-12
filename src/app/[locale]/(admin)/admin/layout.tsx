import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/session";

type AdminSectionLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminSectionLayout({ children, params }: AdminSectionLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
