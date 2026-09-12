"use client";

import { useEffect } from "react";
import { useDraftRegistry } from "@/hooks/use-draft-registry";

/**
 * Warns before a tab close or refresh drops unsaved edits. In-app navigation is
 * already covered — every step control saves first — but the browser's own
 * close/reload can't be intercepted any other way.
 */
export function UnsavedChangesGuard() {
  const registry = useDraftRegistry();
  const hasUnsavedChanges = registry?.hasUnsavedChanges ?? false;

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return null;
}
