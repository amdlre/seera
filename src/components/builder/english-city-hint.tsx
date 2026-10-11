"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  containsArabicScript,
  hasCityCountryShape,
  normalizeEnglishCommas,
} from "@/lib/validations/resume/english-text";

type EnglishCityHintProps = {
  value: string;
  onFix: (value: string) => void;
};

/**
 * Under an English "City, Country" field: offers a one-click fix when the
 * Arabic comma "،" slipped in, or suggests the "City, Country" order when
 * the value has no comma at all.
 */
export function EnglishCityHint({ value, onFix }: EnglishCityHintProps) {
  const t = useTranslations("builder.cityFormat");
  if (!value.trim()) {
    return null;
  }

  if (value.includes("،")) {
    const fixed = normalizeEnglishCommas(value);
    return (
      <div className="text-warning flex flex-wrap items-center gap-2 text-xs">
        <span>{t("arabicComma")}</span>
        {!containsArabicScript(fixed) && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={() => onFix(fixed)}
          >
            {t("useFixed", { value: fixed })}
          </Button>
        )}
      </div>
    );
  }

  if (!containsArabicScript(value) && !hasCityCountryShape(value)) {
    return <p className="text-info text-xs">{t("suggestOrder")}</p>;
  }

  return null;
}
