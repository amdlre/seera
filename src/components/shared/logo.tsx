import { cn } from "@/lib/utils";

/** The Seera brand mark: a document sheet with text lines, matching app/icon.svg. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
      fill="none"
    >
      <rect width="64" height="64" rx="14" className="fill-primary" />
      <rect x="18" y="14" width="28" height="36" rx="3" className="fill-primary-foreground" />
      <rect x="23" y="21" width="18" height="3" rx="1.5" className="fill-primary" />
      <rect x="23" y="28" width="18" height="3" rx="1.5" className="fill-primary" />
      <rect x="23" y="35" width="12" height="3" rx="1.5" className="fill-primary" />
    </svg>
  );
}

/** Brand mark plus the wordmark, used in the marketing and builder headers. */
export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      {showWordmark && (
        <span className="text-foreground text-lg font-semibold tracking-tight">سِيرة</span>
      )}
    </span>
  );
}
