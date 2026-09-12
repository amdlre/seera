"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef } from "react";

type AutosaveFlush = () => Promise<void>;

type AutosaveRegistryValue = {
  register: (flush: AutosaveFlush) => () => void;
  flushAll: () => Promise<void>;
};

const AutosaveRegistryContext = createContext<AutosaveRegistryValue | null>(null);

/**
 * Collects the pending-save flushers of every autosaving form mounted beneath
 * it, so a single "save and leave" action can commit them all at once.
 */
export function AutosaveRegistryProvider({ children }: { children: ReactNode }) {
  const flushersRef = useRef(new Set<AutosaveFlush>());

  const register = useCallback((flush: AutosaveFlush) => {
    const flushers = flushersRef.current;
    flushers.add(flush);
    return () => {
      flushers.delete(flush);
    };
  }, []);

  const flushAll = useCallback(async () => {
    await Promise.all([...flushersRef.current].map((flush) => flush()));
  }, []);

  const value = useMemo(() => ({ register, flushAll }), [register, flushAll]);

  return <AutosaveRegistryContext.Provider value={value}>{children}</AutosaveRegistryContext.Provider>;
}

/** Returns the registry, or null when used outside a provider (forms may be standalone). */
export function useAutosaveRegistry(): AutosaveRegistryValue | null {
  return useContext(AutosaveRegistryContext);
}
