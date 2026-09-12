export type BuilderStepId =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "languages"
  | "custom"
  | "review";

type BuilderStepDefinition = {
  id: BuilderStepId;
  order: number;
  titleKey: string;
  /** Whether this step's page has been built yet. Flip to true as later phases land. */
  implemented: boolean;
  /** Personal info is the only step that cannot be skipped, per PROJECT-BRIEF §5.1. */
  skippable: boolean;
};

/** The full 9-step wizard, in display order. Phases 3-4 implement steps 1-8; review lands in Phase 5. */
export const BUILDER_STEPS: BuilderStepDefinition[] = [
  { id: "personal", order: 1, titleKey: "personal", implemented: true, skippable: false },
  { id: "summary", order: 2, titleKey: "summary", implemented: true, skippable: true },
  { id: "experience", order: 3, titleKey: "experience", implemented: true, skippable: true },
  { id: "education", order: 4, titleKey: "education", implemented: true, skippable: true },
  { id: "skills", order: 5, titleKey: "skills", implemented: true, skippable: true },
  {
    id: "certifications",
    order: 6,
    titleKey: "certifications",
    implemented: true,
    skippable: true,
  },
  { id: "languages", order: 7, titleKey: "languages", implemented: true, skippable: true },
  { id: "custom", order: 8, titleKey: "custom", implemented: true, skippable: true },
  { id: "review", order: 9, titleKey: "review", implemented: true, skippable: true },
];

export const AUTOSAVE_DEBOUNCE_MS = 1500;

export function findBuilderStep(stepId: string): BuilderStepDefinition | null {
  return BUILDER_STEPS.find((step) => step.id === stepId) ?? null;
}

export function getAdjacentSteps(stepId: string): {
  previous: BuilderStepDefinition | null;
  next: BuilderStepDefinition | null;
} {
  const currentIndex = BUILDER_STEPS.findIndex((step) => step.id === stepId);
  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: currentIndex > 0 ? BUILDER_STEPS[currentIndex - 1] : null,
    next: currentIndex < BUILDER_STEPS.length - 1 ? BUILDER_STEPS[currentIndex + 1] : null,
  };
}
