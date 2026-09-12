"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type MonthYearValue = {
  month: number | null;
  year: number | null;
};

type MonthYearPickerProps = {
  value: MonthYearValue;
  onChange: (value: MonthYearValue) => void;
  isCurrent?: boolean;
  onCurrentChange?: (isCurrent: boolean) => void;
  disabled?: boolean;
  id?: string;
};

const MONTH_COUNT = 12;
const YEAR_RANGE = 60;

export function buildYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: YEAR_RANGE }, (_, index) => currentYear - index);
}

/**
 * Month + year selects (never a full calendar) with an optional "currently
 * here" checkbox that disables the field, per ATS-CRITERIA.md §4: ATS systems
 * need month/year only, never a day.
 */
export function MonthYearPicker({
  value,
  onChange,
  isCurrent,
  onCurrentChange,
  disabled,
  id,
}: MonthYearPickerProps) {
  const t = useTranslations("builder.monthYearPicker");
  const months = Array.from({ length: MONTH_COUNT }, (_, index) => index + 1);
  const years = buildYearOptions();
  const isDisabled = disabled || isCurrent;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs">{t("callout")}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={value.month?.toString() ?? ""}
          onValueChange={(month) => onChange({ ...value, month: Number(month) })}
          disabled={isDisabled}
        >
          <SelectTrigger id={id} className="w-32">
            <SelectValue placeholder={t("month")} />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month.toString()}>
                {t(`months.${month}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.year?.toString() ?? ""}
          onValueChange={(year) => onChange({ ...value, year: Number(year) })}
          disabled={isDisabled}
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder={t("year")} />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {onCurrentChange && (
          <Label className="flex items-center gap-2 text-sm font-normal">
            <Checkbox
              checked={isCurrent ?? false}
              onCheckedChange={(checked) => onCurrentChange(checked === true)}
              disabled={disabled}
            />
            {t("currentlyHere")}
          </Label>
        )}
      </div>
    </div>
  );
}
