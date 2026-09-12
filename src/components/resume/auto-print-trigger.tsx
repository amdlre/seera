"use client";

import { useEffect } from "react";

/**
 * Calls window.print() once fonts/layout are ready, when the page was opened
 * via the "Print" button (?autoprint=1). Visiting /print directly without
 * that param just shows the content, useful for a quick preview.
 */
export function AutoPrintTrigger() {
  useEffect(() => {
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (!cancelled) {
        window.print();
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
