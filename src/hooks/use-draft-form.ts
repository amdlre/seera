import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldValues, UseFormWatch } from "react-hook-form";
import { useDraftRegistry } from "@/hooks/use-draft-registry";

export type DraftStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

/**
 * Marks a form dirty as the user types, but sends nothing until something asks
 * it to save — the "save as draft" button, moving between steps, or leaving the
 * builder. Returns the status for the indicator.
 */
export function useDraftForm<T extends FieldValues>(
  watch: UseFormWatch<T>,
  onSave: (values: T) => Promise<boolean>,
): DraftStatus {
  const [status, setStatus] = useState<DraftStatus>("idle");
  const onSaveRef = useRef(onSave);
  const isDirtyRef = useRef(false);
  const registry = useDraftRegistry();

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const save = useCallback(async () => {
    if (!isDirtyRef.current) return true;

    setStatus("saving");
    try {
      const success = await onSaveRef.current(watch() as T);
      if (success) isDirtyRef.current = false;
      setStatus(success ? "saved" : "error");
      return success;
    } catch {
      // A Server Action can reject outright (expired session, network drop).
      setStatus("error");
      return false;
    }
  }, [watch]);

  useEffect(() => {
    if (!registry) return;
    return registry.register(save);
  }, [registry, save]);

  useEffect(() => {
    const subscription = watch(() => {
      isDirtyRef.current = true;
      setStatus("unsaved");
      registry?.setDirty(save, true);
    });
    return () => subscription.unsubscribe();
  }, [watch, registry, save]);

  useEffect(() => {
    if (status === "saved") registry?.setDirty(save, false);
  }, [status, registry, save]);

  return status;
}
