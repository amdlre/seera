import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatTone = "blue" | "violet" | "emerald" | "amber" | "sky" | "rose" | "teal" | "indigo";

const TONE_STYLES: Record<StatTone, string> = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: StatTone;
}) {
  return (
    <div className="border-border bg-card flex items-center gap-3 rounded-xl border p-4">
      <span
        className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", TONE_STYLES[tone])}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-muted-foreground truncate text-xs">{label}</span>
        <span className="text-foreground text-2xl font-bold">{value}</span>
      </div>
    </div>
  );
}
