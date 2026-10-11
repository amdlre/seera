"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type BulletListFieldProps = {
  label: string;
  tip: string;
  values: string[];
  onChange: (values: string[]) => void;
  dir: "rtl" | "ltr";
  addLabel: string;
};

/**
 * A required, editable list of achievement bullets (one textarea each) with
 * its label, red required marker and writing tip — used for one language of
 * experience and project bullets.
 */
export function BulletListField({
  label,
  tip,
  values,
  onChange,
  dir,
  addLabel,
}: BulletListFieldProps) {
  const tCommon = useTranslations("builder.common");

  function updateBullet(index: number, value: string) {
    onChange(values.map((bullet, i) => (i === index ? value : bullet)));
  }

  function removeBullet(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Label>{label}</Label>
        <span className="text-destructive" aria-hidden="true">
          *
        </span>
      </div>
      <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
        <span aria-hidden="true">💡</span>
        <span>{tip}</span>
      </p>
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <Textarea
            dir={dir}
            rows={2}
            value={value}
            aria-label={`${label} ${index + 1}`}
            onChange={(event) => updateBullet(index, event.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-fit"
            onClick={() => removeBullet(index)}
            aria-label={tCommon("delete")}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit gap-1"
        onClick={() => onChange([...values, ""])}
      >
        <Plus className="size-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}
