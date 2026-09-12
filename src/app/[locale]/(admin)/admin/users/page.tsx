import { ShieldBan, UserCheck, Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StatCard } from "@/components/admin/stat-card";
import { AdminUsersTable } from "@/components/admin/users-table";
import type { AdminUserFilters } from "@/server/repositories/admin-users.repository";
import { getUsersOverview, listUsers } from "@/server/services/admin-users.service";

const PAGE_SIZE = 10;

type AdminUsersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminUsersPage({ params, searchParams }: AdminUsersPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const page = Math.max(1, Number(query.page) || 1);

  const filters: AdminUserFilters = {
    search: query.search || undefined,
    role: query.role === "user" || query.role === "admin" ? query.role : undefined,
    sortDir: query.sortDir === "asc" ? "asc" : "desc",
    page,
    pageSize: PAGE_SIZE,
  };

  const [{ rows, total }, overview, t] = await Promise.all([
    listUsers(filters),
    getUsersOverview(),
    getTranslations("admin.usersTable"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t("summaryTotal")} value={overview.total} icon={Users} tone="blue" />
        <StatCard label={t("summaryActive")} value={overview.active} icon={UserCheck} tone="emerald" />
        <StatCard label={t("summaryBlocked")} value={overview.blocked} icon={ShieldBan} tone="rose" />
      </div>
      <AdminUsersTable rows={rows} total={total} pageSize={PAGE_SIZE} filters={filters} />
    </div>
  );
}
