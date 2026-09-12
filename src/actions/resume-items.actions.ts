"use server";

import type { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { logger } from "@/lib/logger";
import { certificationItemDraftSchema } from "@/lib/validations/resume/certifications";
import {
  customBulletItemDraftSchema,
  customDatedItemDraftSchema,
  customParagraphItemDraftSchema,
} from "@/lib/validations/resume/custom-section";
import { educationItemDraftSchema } from "@/lib/validations/resume/education";
import { experienceItemDraftSchema } from "@/lib/validations/resume/experience";
import { languageItemDraftSchema } from "@/lib/validations/resume/languages";
import { skillCategoryItemDraftSchema } from "@/lib/validations/resume/skills";
import * as itemsService from "@/server/services/resume-items.service";

export type ItemDataKind =
  | "experience"
  | "education"
  | "skillCategory"
  | "certification"
  | "language"
  | "customBullet"
  | "customDated"
  | "customParagraph";

const DRAFT_SCHEMA_BY_KIND: Record<ItemDataKind, z.ZodTypeAny> = {
  experience: experienceItemDraftSchema,
  education: educationItemDraftSchema,
  skillCategory: skillCategoryItemDraftSchema,
  certification: certificationItemDraftSchema,
  language: languageItemDraftSchema,
  customBullet: customBulletItemDraftSchema,
  customDated: customDatedItemDraftSchema,
  customParagraph: customParagraphItemDraftSchema,
};

export type ItemActionResult = { success: true } | { success: false; messageKey: string };
export type AddItemActionResult =
  | { success: true; itemId: string }
  | { success: false; messageKey: string };

function validateDraft(
  kind: ItemDataKind,
  input: unknown,
): { ok: true; data: Record<string, unknown> } | { ok: false } {
  const parsed = DRAFT_SCHEMA_BY_KIND[kind].safeParse(input);
  return parsed.success ? { ok: true, data: parsed.data as Record<string, unknown> } : { ok: false };
}

/** Appends a new item to a section (e.g. a blank experience entry). */
export async function addItemAction(
  sectionId: string,
  kind: ItemDataKind,
  defaultData: unknown,
): Promise<AddItemActionResult> {
  const session = await requireAuth();
  const validated = validateDraft(kind, defaultData);
  if (!validated.ok) {
    return { success: false, messageKey: "builder.errors.invalidDraft" };
  }

  const result = await itemsService.addResumeItem(sectionId, session.sub, validated.data);
  if (!result.ok) {
    logger.warn("add-item-failed", { sectionId, code: result.error.code });
    return { success: false, messageKey: "builder.errors.saveFailed" };
  }

  return { success: true, itemId: result.value.id };
}

/** Validates and persists a draft of one item's data (autosave). */
export async function saveItemDraftAction(
  itemId: string,
  kind: ItemDataKind,
  input: unknown,
): Promise<ItemActionResult> {
  const session = await requireAuth();
  const validated = validateDraft(kind, input);
  if (!validated.ok) {
    return { success: false, messageKey: "builder.errors.invalidDraft" };
  }

  const result = await itemsService.saveResumeItemDraft(itemId, session.sub, validated.data);
  if (!result.ok) {
    logger.warn("save-item-failed", { itemId, code: result.error.code });
    return { success: false, messageKey: "builder.errors.saveFailed" };
  }

  return { success: true };
}

/** Deletes a single item (e.g. removing one experience entry). */
export async function deleteItemAction(itemId: string): Promise<ItemActionResult> {
  const session = await requireAuth();
  const result = await itemsService.deleteResumeItemForUser(itemId, session.sub);
  if (!result.ok) {
    logger.warn("delete-item-failed", { itemId, code: result.error.code });
    return { success: false, messageKey: "builder.errors.saveFailed" };
  }

  return { success: true };
}

/** Persists a new item order for a section after a drag-and-drop reorder. */
export async function reorderItemsAction(
  sectionId: string,
  orderedItemIds: string[],
): Promise<ItemActionResult> {
  const session = await requireAuth();
  const result = await itemsService.reorderResumeItemsForUser(
    sectionId,
    session.sub,
    orderedItemIds,
  );
  if (!result.ok) {
    logger.warn("reorder-items-failed", { sectionId, code: result.error.code });
    return { success: false, messageKey: "builder.errors.saveFailed" };
  }

  return { success: true };
}
