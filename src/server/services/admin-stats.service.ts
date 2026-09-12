import {
  averageAtsScore,
  countActiveResumes,
  countActiveUsers,
  countCompletedResumes,
  countExportsByLanguage,
  countNewUsersSince,
  type DailyCount,
  exportsTimeSeries,
  type FunnelCounts,
  funnelCounts,
  registrationsTimeSeries,
} from "@/server/repositories/admin-stats.repository";

export type AdminDashboardStats = {
  totalUsers: number;
  totalResumes: number;
  completedResumes: number;
  completionRate: number;
  exportsAr: number;
  exportsEn: number;
  averageAtsScore: number;
  newUsersLast7Days: number;
  registrationsTimeSeries: DailyCount[];
  exportsTimeSeries: DailyCount[];
  funnel: FunnelCounts;
};

/** Aggregates every admin-dashboard stat for a given lookback period. */
export async function getDashboardStats(periodDays: number): Promise<AdminDashboardStats> {
  const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalResumes,
    completedResumes,
    exportsByLanguage,
    avgScore,
    newUsersLast7Days,
    registrations,
    exportsSeries,
    funnel,
  ] = await Promise.all([
    countActiveUsers(),
    countActiveResumes(),
    countCompletedResumes(),
    countExportsByLanguage(),
    averageAtsScore(),
    countNewUsersSince(sevenDaysAgo),
    registrationsTimeSeries(since),
    exportsTimeSeries(since),
    funnelCounts(since),
  ]);

  return {
    totalUsers,
    totalResumes,
    completedResumes,
    completionRate: totalResumes > 0 ? Math.round((completedResumes / totalResumes) * 100) : 0,
    exportsAr: exportsByLanguage.ar,
    exportsEn: exportsByLanguage.en,
    averageAtsScore: avgScore,
    newUsersLast7Days,
    registrationsTimeSeries: registrations,
    exportsTimeSeries: exportsSeries,
    funnel,
  };
}
