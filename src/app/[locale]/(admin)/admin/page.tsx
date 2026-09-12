import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExportLanguageChart } from "@/components/admin/export-language-chart";
import { FunnelCard } from "@/components/admin/funnel-card";
import { PeriodFilter } from "@/components/admin/period-filter";
import { StatCard } from "@/components/admin/stat-card";
import { TimelineChart } from "@/components/admin/timeline-chart";
import { getDashboardStats } from "@/server/services/admin-stats.service";

type AdminPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ days?: string }>;
};

const VALID_PERIODS = [7, 30, 90];

export default async function AdminPage({ params, searchParams }: AdminPageProps) {
  const { locale } = await params;
  const { days: rawDays } = await searchParams;
  setRequestLocale(locale);

  const days = VALID_PERIODS.includes(Number(rawDays)) ? Number(rawDays) : 30;
  const stats = await getDashboardStats(days);
  const t = await getTranslations("admin.stats");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-foreground text-xl font-semibold">{t("title")}</h1>
        <PeriodFilter currentDays={days} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t("totalUsers")} value={stats.totalUsers} />
        <StatCard label={t("totalResumes")} value={stats.totalResumes} />
        <StatCard label={t("completedResumes")} value={stats.completedResumes} />
        <StatCard label={t("completionRate")} value={`${stats.completionRate}%`} />
        <StatCard label={t("exportsAr")} value={stats.exportsAr} />
        <StatCard label={t("exportsEn")} value={stats.exportsEn} />
        <StatCard label={t("averageAtsScore")} value={stats.averageAtsScore} />
        <StatCard label={t("newUsers")} value={stats.newUsersLast7Days} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TimelineChart registrations={stats.registrationsTimeSeries} exportsSeries={stats.exportsTimeSeries} />
        <ExportLanguageChart exportsAr={stats.exportsAr} exportsEn={stats.exportsEn} />
      </div>

      <FunnelCard funnel={stats.funnel} />
    </div>
  );
}
