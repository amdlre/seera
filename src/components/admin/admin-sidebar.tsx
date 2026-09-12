"use client";

import { BarChart3, FileText, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", key: "stats", Icon: BarChart3 },
  { href: "/admin/resumes", key: "resumes", Icon: FileText },
  { href: "/admin/users", key: "users", Icon: Users },
] as const;

export function AdminSidebar() {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  return (
    <aside className="border-border bg-card sticky top-0 h-svh w-16 shrink-0 border-e md:w-56">
      <nav aria-label={t("ariaLabel")} className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, key, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              title={t(key)}
              className={cn(
                "flex items-center justify-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:justify-start",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4.5 shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">{t(key)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
