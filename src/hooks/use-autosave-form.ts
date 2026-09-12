import { useEffect, useRef, useState } from "react";
import type { FieldValues, UseFormWatch } from "react-hook-form";
import { AUTOSAVE_DEBOUNCE_MS } from "@/lib/constants/builder";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounces form changes (1.5s) and calls `onSave` with the latest values.
 * Returns the current save status for a "Saved ✓" indicator.
 */
export function useAutosaveForm<T extends FieldValues>(
  watch: UseFormWatch<T>,
  onSave: (values: T) => Promise<boolean>,
): AutosaveStatus {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    const subscription = watch(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setStatus("saving");
        void onSaveRef.current(watch() as T).then((success) => {
          setStatus(success ? "saved" : "error");
        });
      }, AUTOSAVE_DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watch]);

  return status;
}
