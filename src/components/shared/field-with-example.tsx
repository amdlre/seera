"use client";

import { ChevronDown, HelpCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FieldLabel } from "@/components/shared/field-label";
import { FormFieldMessage } from "@/components/shared/form-field-message";
import { FormItem } from "@/components/ui/form";
import type { FieldGuide } from "@/lib/constants/field-guides";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type FieldWithExampleProps = {
  label: string;
  required?: boolean;
  guide: FieldGuide;
  errorMessageKey?: string;
  onUseExample: (value: string) => void;
  children: ReactNode;
};

/**
 * The standard field wrapper used across the builder: label + required star,
 * a "?" tooltip and permanent tip line with the writing rule, the input
 * itself, and a collapsible full example with a one-click "use this" button.
 */
export function FieldWithExample({
  label,
  required,
  guide,
  errorMessageKey,
  onUseExample,
  children,
}: FieldWithExampleProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("builder.fieldExample");
  const [isExampleOpen, setIsExampleOpen] = useState(false);

  return (
    <FormItem>
      <div className="flex items-center gap-1">
        <FieldLabel required={required}>{label}</FieldLabel>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={t("tooltipAriaLabel")}
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{guide.tip[locale]}</TooltipContent>
        </Tooltip>
      </div>

      {children}

      <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
        <span aria-hidden="true">💡</span>
        <span>{guide.tip[locale]}</span>
      </p>

      <FormFieldMessage messageKey={errorMessageKey} />

      <Collapsible open={isExampleOpen} onOpenChange={setIsExampleOpen}>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="link" className="h-auto w-fit justify-start gap-1 p-0 text-xs">
            <ChevronDown
              className={cn("size-3 transition-transform", isExampleOpen && "rotate-180")}
            />
            {t("seeExample")}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="border-border bg-muted/50 mt-2 flex flex-col gap-2 rounded-lg border p-3 text-sm">
          <p className="text-foreground">{guide.example[locale]}</p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-fit"
            onClick={() => onUseExample(guide.example[locale])}
          >
            {t("useExample")}
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </FormItem>
  );
}
