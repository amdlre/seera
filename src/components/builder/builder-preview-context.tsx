"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ResumeSection } from "@/db/schema";
import type { PersonalInfoDraftInput } from "@/lib/validations/resume/personal-info";
import type { SummaryDraftInput } from "@/lib/validations/resume/summary";

export type PreviewItem = { id: string; data: Record<string, unknown> };

type BuilderPreviewContextValue = {
  sections: ResumeSection[];
  personalInfo: PersonalInfoDraftInput;
  summary: SummaryDraftInput;
  itemsBySectionId: Record<string, PreviewItem[]>;
  updatePersonalInfo: Dispatch<SetStateAction<PersonalInfoDraftInput>>;
  updateSummary: Dispatch<SetStateAction<SummaryDraftInput>>;
  updateSectionItem: (sectionId: string, itemId: string, data: Record<string, unknown>) => void;
  appendSectionItem: (sectionId: string, item: PreviewItem) => void;
  removeSectionItem: (sectionId: string, itemId: string) => void;
  reorderSectionItemsList: (sectionId: string, orderedItemIds: string[]) => void;
  addSection: (section: ResumeSection) => void;
  removeSection: (sectionId: string) => void;
  setSectionVisibilityLocal: (sectionId: string, isVisible: boolean) => void;
  reorderSectionsLocal: (orderedSectionIds: string[]) => void;
};

const BuilderPreviewContext = createContext<BuilderPreviewContextValue | null>(null);

/**
 * Holds the builder's in-progress data so the live preview panel updates as
 * the user types, without waiting for the debounced autosave round-trip.
 */
export function BuilderPreviewProvider({
  sections: initialSections,
  initialPersonalInfo,
  initialSummary,
  initialItemsBySectionId,
  children,
}: {
  sections: ResumeSection[];
  initialPersonalInfo: PersonalInfoDraftInput;
  initialSummary: SummaryDraftInput;
  initialItemsBySectionId: Record<string, PreviewItem[]>;
  children: ReactNode;
}) {
  const [sections, setSections] = useState(initialSections);
  const [personalInfo, updatePersonalInfo] = useState(initialPersonalInfo);
  const [summary, updateSummary] = useState(initialSummary);
  const [itemsBySectionId, setItemsBySectionId] = useState(initialItemsBySectionId);

  const updateSectionItem = useCallback(
    (sectionId: string, itemId: string, data: Record<string, unknown>) => {
      setItemsBySectionId((previous) => ({
        ...previous,
        [sectionId]: (previous[sectionId] ?? []).map((item) =>
          item.id === itemId ? { ...item, data } : item,
        ),
      }));
    },
    [],
  );

  const appendSectionItem = useCallback((sectionId: string, item: PreviewItem) => {
    setItemsBySectionId((previous) => ({
      ...previous,
      [sectionId]: [...(previous[sectionId] ?? []), item],
    }));
  }, []);

  const removeSectionItem = useCallback((sectionId: string, itemId: string) => {
    setItemsBySectionId((previous) => ({
      ...previous,
      [sectionId]: (previous[sectionId] ?? []).filter((item) => item.id !== itemId),
    }));
  }, []);

  const reorderSectionItemsList = useCallback((sectionId: string, orderedItemIds: string[]) => {
    setItemsBySectionId((previous) => {
      const current = previous[sectionId] ?? [];
      const reordered = orderedItemIds
        .map((id) => current.find((item) => item.id === id))
        .filter((item): item is PreviewItem => item !== undefined);
      return { ...previous, [sectionId]: reordered };
    });
  }, []);

  const addSection = useCallback((section: ResumeSection) => {
    setSections((previous) => [...previous, section]);
    setItemsBySectionId((previous) => ({ ...previous, [section.id]: [] }));
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    setSections((previous) => previous.filter((section) => section.id !== sectionId));
    setItemsBySectionId((previous) => {
      const next = { ...previous };
      delete next[sectionId];
      return next;
    });
  }, []);

  const setSectionVisibilityLocal = useCallback((sectionId: string, isVisible: boolean) => {
    setSections((previous) =>
      previous.map((section) => (section.id === sectionId ? { ...section, isVisible } : section)),
    );
  }, []);

  const reorderSectionsLocal = useCallback((orderedSectionIds: string[]) => {
    setSections((previous) => {
      const personal = previous.filter((section) => section.type === "personal");
      const reorderable = orderedSectionIds
        .map((id) => previous.find((section) => section.id === id))
        .filter((section): section is ResumeSection => section !== undefined);
      return [...personal, ...reorderable];
    });
  }, []);

  const value = useMemo<BuilderPreviewContextValue>(
    () => ({
      sections,
      personalInfo,
      summary,
      itemsBySectionId,
      updatePersonalInfo,
      updateSummary,
      updateSectionItem,
      appendSectionItem,
      removeSectionItem,
      reorderSectionItemsList,
      addSection,
      removeSection,
      setSectionVisibilityLocal,
      reorderSectionsLocal,
    }),
    [
      sections,
      personalInfo,
      summary,
      itemsBySectionId,
      updateSectionItem,
      appendSectionItem,
      removeSectionItem,
      reorderSectionItemsList,
      addSection,
      removeSection,
      setSectionVisibilityLocal,
      reorderSectionsLocal,
    ],
  );

  return <BuilderPreviewContext.Provider value={value}>{children}</BuilderPreviewContext.Provider>;
}

export function useBuilderPreview(): BuilderPreviewContextValue {
  const context = useContext(BuilderPreviewContext);
  if (!context) {
    throw new Error("useBuilderPreview must be used within a BuilderPreviewProvider");
  }
  return context;
}
