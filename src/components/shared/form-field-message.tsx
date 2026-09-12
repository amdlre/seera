"use client";

import { useTranslations } from "next-intl";

type FormFieldMessageProps = {
  messageKey?: string;
};

/** Translates a Zod validation message key (e.g. "validation.required") into UI text. */
export function FormFieldMessage({ messageKey }: FormFieldMessageProps) {
  const t = useTranslations();

  if (!messageKey) {
    return null;
  }

  return <p className="text-destructive text-sm">{t(messageKey)}</p>;
}
