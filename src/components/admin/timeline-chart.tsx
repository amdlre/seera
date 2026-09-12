"use client";

import { useTranslations } from "next-intl";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyCount } from "@/server/repositories/admin-stats.repository";

function mergeSeries(registrations: DailyCount[], exportsSeries: DailyCount[]) {
  const dates = new Set([...registrations.map((r) => r.date), ...exportsSeries.map((r) => r.date)]);
  const registrationsByDate = new Map(registrations.map((r) => [r.date, r.count]));
  const exportsByDate = new Map(exportsSeries.map((r) => [r.date, r.count]));

  return [...dates].sort().map((date) => ({
    date,
    registrations: registrationsByDate.get(date) ?? 0,
    exports: exportsByDate.get(date) ?? 0,
  }));
}

export function TimelineChart({
  registrations,
  exportsSeries,
}: {
  registrations: DailyCount[];
  exportsSeries: DailyCount[];
}) {
  const t = useTranslations("admin.stats");
  const data = mergeSeries(registrations, exportsSeries);

  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <h3 className="text-foreground mb-3 text-sm font-semibold">{t("timelineTitle")}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="registrations" name={t("registrations")} stroke="var(--color-primary)" strokeWidth={2} />
          <Line type="monotone" dataKey="exports" name={t("exports")} stroke="var(--color-success)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
