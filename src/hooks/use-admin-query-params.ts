"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";

/**
 * Reads/writes the current page's query string, used by the admin tables to
 * drive server-side search/filter/sort/pagination through the URL.
 */
export function useAdminQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      if (!("page" in updates)) {
        next.delete("page");
      }
      router.push(`${pathname}?${next.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return { searchParams, setParams, refresh };
}
