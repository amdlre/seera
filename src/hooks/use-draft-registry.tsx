"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type DraftSaver = () => Promise<boolean>;

type DraftRegistryValue = {
  /** Registers one form's saver; returns an unregister function. */
  register: (saver: DraftSaver) => () => void;
  /** Reports whether a form currently holds unsaved edits. */
  setDirty: (saver: DraftSaver, dirty: boolean) => void;
  /** True while any mounted form has edits that were never sent to the server. */
  hasUnsavedChanges: boolean;
  /** Saves every mounted form. Resolves false if any save failed. */
  saveAll: () => Promise<boolean>;
};

const DraftRegistryContext = createContext<DraftRegistryValue | null>(null);

/**
 * Tracks every draft form mounted beneath it so one explicit action — the
 * "save as draft" button, or moving between steps — can persist them all.
 * Nothing is sent while the user types; this is what keeps the builder from
 * firing a request per keystroke.
 */
export function DraftRegistryProvider({ children }: { children: ReactNode }) {
  const saversRef = useRef(new Set<DraftSaver>());
  const dirtyRef = useRef(new Set<DraftSaver>());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const register = useCallback((saver: DraftSaver) => {
    saversRef.current.add(saver);
    return () => {
      saversRef.current.delete(saver);
      dirtyRef.current.delete(saver);
      setHasUnsavedChanges(dirtyRef.current.size > 0);
    };
  }, []);

  const setDirty = useCallback((saver: DraftSaver, dirty: boolean) => {
    if (dirty) dirtyRef.current.add(saver);
    else dirtyRef.current.delete(saver);
    setHasUnsavedChanges(dirtyRef.current.size > 0);
  }, []);

  const saveAll = useCallback(async () => {
    const results = await Promise.all([...saversRef.current].map((save) => save()));
    return results.every(Boolean);
  }, []);

  const value = useMemo(
    () => ({ register, setDirty, hasUnsavedChanges, saveAll }),
    [register, setDirty, hasUnsavedChanges, saveAll],
  );

  return <DraftRegistryContext.Provider value={value}>{children}</DraftRegistryContext.Provider>;
}

/** Returns the registry, or null when a form is rendered outside the builder. */
export function useDraftRegistry(): DraftRegistryValue | null {
  return useContext(DraftRegistryContext);
}
