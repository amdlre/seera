"use client";

import { DirectionProvider } from "@radix-ui/react-direction";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Wires the light/dark theme class onto <html> and tells Radix popovers which
 * way to lay out, so menus and selects flip correctly in Arabic.
 */
export function ThemeProvider({ children, dir }: { children: ReactNode; dir: "rtl" | "ltr" }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DirectionProvider dir={dir}>{children}</DirectionProvider>
    </NextThemesProvider>
  );
}
