import { setRequestLocale } from "next-intl/server";
import { AdminResumesTable } from "@/components/admin/resumes-table";
import type { AdminResumeFilters, AdminResumeSortColumn } from "@/server/repositories/admin-resumes.repository";
import { listResumes } from "@/server/services/admin-resumes.service";

const PAGE_SIZE = 10;
const SORT_COLUMNS: AdminResumeSortColumn[] = ["updatedAt", "title", "atsScore", "status"];

type AdminResumesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminResumesPage({ params, searchParams }: AdminResumesPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const page = Math.max(1, Number(query.page) || 1);
  const sortBy = SORT_COLUMNS.includes(query.sortBy as AdminResumeSortColumn)
    ? (query.sortBy as AdminResumeSortColumn)
    : "updatedAt";

  const filters: AdminResumeFilters = {
    search: query.search || undefined,
    status: query.status === "draft" || query.status === "completed" ? query.status : undefined,
    exportLanguage: query.exportLanguage === "ar" || query.exportLanguage === "en" ? query.exportLanguage : undefined,
    atsMin: query.atsMin ? Number(query.atsMin) : undefined,
    atsMax: query.atsMax ? Number(query.atsMax) : undefined,
    sortBy,
    sortDir: query.sortDir === "asc" ? "asc" : "desc",
    page,
    pageSize: PAGE_SIZE,
  };

  const { rows, total } = await listResumes(filters);

  return <AdminResumesTable rows={rows} total={total} pageSize={PAGE_SIZE} filters={filters} />;
}
