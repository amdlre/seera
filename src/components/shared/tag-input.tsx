"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type KeyboardEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { parseTags, serializeTags, tagKey } from "@/lib/resume/tags";
import { cn } from "@/lib/utils";

type TagInputProps = {
  /** Stored as a comma-separated string, so print and ATS code read it unchanged. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  dir?: "ltr" | "rtl";
  placeholder?: string;
  invalid?: boolean;
};

const COMMIT_KEYS = new Set(["Enter", ",", "،", "Tab"]);

/**
 * A chip-style input for skill and technology lists: type a value and press
 * Enter or comma to add it, Backspace on an empty input removes the last one.
 * Pasting "a, b, c" adds them all. Duplicates are refused with a short notice.
 */
export function TagInput({ value, onChange, onBlur, dir, placeholder, invalid }: TagInputProps) {
  const t = useTranslations("builder.tags");
  const [draft, setDraft] = useState("");
  const [duplicate, setDuplicate] = useState<string | null>(null);
  const tags = parseTags(value);

  function commit(rawInput: string): void {
    const incoming = parseTags(rawInput);
    if (incoming.length === 0) return;
    const existingKeys = new Set(tags.map(tagKey));
    const fresh = incoming.filter((tag) => !existingKeys.has(tagKey(tag)));
    setDuplicate(
      fresh.length < incoming.length
        ? (incoming.find((tag) => existingKeys.has(tagKey(tag))) ?? null)
        : null,
    );
    if (fresh.length > 0) onChange(serializeTags([...tags, ...fresh]));
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (COMMIT_KEYS.has(event.key) && draft.trim()) {
      event.preventDefault();
      commit(draft);
    } else if (event.key === "Backspace" && !draft && tags.length > 0) {
      onChange(serializeTags(tags.slice(0, -1)));
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        dir={dir}
        className={cn(
          "border-input focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-lg border bg-transparent px-2 py-1 focus-within:ring-3",
          invalid && "border-destructive ring-destructive/20 ring-3",
        )}
      >
        {tags.map((tag) => (
          <Badge key={tagKey(tag)} variant="secondary" className="gap-1 ps-2 pe-1">
            {tag}
            <button
              type="button"
              onClick={() => onChange(serializeTags(tags.filter((candidate) => candidate !== tag)))}
              aria-label={t("remove", { tag })}
              className="text-muted-foreground hover:text-foreground rounded-sm"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onPaste={(event) => {
            event.preventDefault();
            commit(`${draft}${event.clipboardData.getData("text")}`);
          }}
          onBlur={() => {
            commit(draft);
            onBlur?.();
          }}
          placeholder={tags.length === 0 ? placeholder : undefined}
          aria-label={placeholder}
          className="placeholder:text-muted-foreground/60 min-w-24 flex-1 bg-transparent py-0.5 text-base outline-none md:text-sm"
        />
      </div>
      {duplicate && <p className="text-warning text-xs">{t("duplicate", { tag: duplicate })}</p>}
    </div>
  );
}
