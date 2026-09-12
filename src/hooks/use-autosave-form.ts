import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldValues, UseFormWatch } from "react-hook-form";
import { useAutosaveRegistry } from "@/hooks/use-autosave-registry";
import { AUTOSAVE_DEBOUNCE_MS } from "@/lib/constants/builder";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounces form changes (1.5s) and calls `onSave` with the latest values.
 * Returns the current save status for a "Saved ✓" indicator, and registers a
 * flusher so a pending save can be committed immediately on exit.
 */
export function useAutosaveForm<T extends FieldValues>(
  watch: UseFormWatch<T>,
  onSave: (values: T) => Promise<boolean>,
): AutosaveStatus {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  const registry = useAutosaveRegistry();

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const save = useCallback(async () => {
    setStatus("saving");
    const success = await onSaveRef.current(watch() as T);
    setStatus(success ? "saved" : "error");
  }, [watch]);

  useEffect(() => {
    const subscription = watch(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        void save();
      }, AUTOSAVE_DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watch, save]);

  useEffect(() => {
    if (!registry) return;

    return registry.register(async () => {
      // Only a debounce still in flight has unsaved edits; anything else is
      // already persisted by the timer above.
      if (!timeoutRef.current) return;
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      await save();
    });
  }, [registry, save]);

  return status;
}
