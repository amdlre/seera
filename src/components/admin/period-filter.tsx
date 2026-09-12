"use client";

import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";

const PERIODS = [7, 30, 90] as const;

export function PeriodFilter({ currentDays }: { currentDays: number }) {
  const t = useTranslations("admin.stats");
  const router = useRouter();

  return (
    <Select
      value={currentDays.toString()}
      onValueChange={(value) => router.push(`/admin?days=${value}`)}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIODS.map((days) => (
          <SelectItem key={days} value={days.toString()}>
            {t("lastNDays", { days })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
