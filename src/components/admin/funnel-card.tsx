import { getTranslations } from "next-intl/server";
import type { FunnelCounts } from "@/server/repositories/admin-stats.repository";

export async function FunnelCard({ funnel }: { funnel: FunnelCounts }) {
  const t = await getTranslations("admin.stats");
  const base = funnel.registered || 1;

  const stages: Array<{ key: keyof FunnelCounts; label: string }> = [
    { key: "registered", label: t("funnelRegistered") },
    { key: "createdResume", label: t("funnelCreatedResume") },
    { key: "completed", label: t("funnelCompleted") },
    { key: "exported", label: t("funnelExported") },
  ];

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4">
      <h3 className="text-foreground text-sm font-semibold">{t("funnelTitle")}</h3>
      {stages.map((stage) => {
        const value = funnel[stage.key];
        const percentage = Math.round((value / base) * 100);
        return (
          <div key={stage.key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{stage.label}</span>
              <span className="text-foreground font-medium">
                {value} ({percentage}%)
              </span>
            </div>
            <div className="bg-border h-1.5 w-full overflow-hidden rounded-full">
              <div className="bg-primary h-full" style={{ width: `${percentage}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
