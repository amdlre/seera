import { setRequestLocale } from "next-intl/server";
import { AdminUsersTable } from "@/components/admin/users-table";
import type { AdminUserFilters } from "@/server/repositories/admin-users.repository";
import { listUsers } from "@/server/services/admin-users.service";

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

  const { rows, total } = await listUsers(filters);

  return <AdminUsersTable rows={rows} total={total} pageSize={PAGE_SIZE} filters={filters} />;
}
