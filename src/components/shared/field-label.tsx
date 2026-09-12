import type { ReactNode } from "react";
import { FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";

type FieldLabelProps = {
  children: ReactNode;
  required?: boolean;
  className?: string;
};

/** Standard form field label with a red required-marker, used by every field in the app. */
export function FieldLabel({ children, required, className }: FieldLabelProps) {
  return (
    <FormLabel className={cn("flex items-center gap-1", className)}>
      {children}
      {required && (
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      )}
    </FormLabel>
  );
}
