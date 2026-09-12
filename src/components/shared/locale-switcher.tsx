"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = { ar: "العربية", en: "English" };

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-sm">
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={pathname}
          locale={loc}
          aria-current={loc === locale ? "true" : undefined}
          className={
            loc === locale
              ? "text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground transition-colors"
          }
        >
          {LOCALE_LABELS[loc]}
        </Link>
      ))}
    </div>
  );
}
