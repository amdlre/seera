"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, usePathname } from "@/i18n/navigation";

/** Toggles between the two locales, keeping the current path. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("common");
  const nextLocale = locale === "ar" ? "en" : "ar";
  const label = t("switchTo", { locale: nextLocale === "ar" ? "العربية" : "English" });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href={pathname} locale={nextLocale} aria-label={label}>
            <Languages className="size-4" aria-hidden="true" />
            <span className="text-xs font-medium uppercase">{nextLocale}</span>
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
