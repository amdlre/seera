import { CheckCircle2, FileStack, FilePen } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StatCard } from "@/components/admin/stat-card";
import { AdminResumesTable } from "@/components/admin/resumes-table";
import type { AdminResumeFilters, AdminResumeSortColumn } from "@/server/repositories/admin-resumes.repository";
import { getResumesOverview, listResumes } from "@/server/services/admin-resumes.service";

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

  const [{ rows, total }, overview, t] = await Promise.all([
    listResumes(filters),
    getResumesOverview(),
    getTranslations("admin.resumesTable"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t("summaryTotal")} value={overview.total} icon={FileStack} tone="blue" />
        <StatCard label={t("summaryDrafts")} value={overview.draft} icon={FilePen} tone="amber" />
        <StatCard
          label={t("summaryCompleted")}
          value={overview.completed}
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>
      <AdminResumesTable rows={rows} total={total} pageSize={PAGE_SIZE} filters={filters} />
    </div>
  );
}
