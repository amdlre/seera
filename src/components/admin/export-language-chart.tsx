"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ExportLanguageChart({ exportsAr, exportsEn }: { exportsAr: number; exportsEn: number }) {
  const t = useTranslations("admin.stats");
  const data = [
    { language: t("arabic"), count: exportsAr },
    { language: t("english"), count: exportsEn },
  ];

  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <h3 className="text-foreground mb-3 text-sm font-semibold">{t("exportLanguageTitle")}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="language" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
