import { Fragment } from "react";

/** A word containing a hyphen between letters/digits, e.g. "user-centered", "skip-to-content". */
const HYPHENATED_WORD = /([\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+)/u;

/**
 * Renders text with every hyphenated word kept on one line, so the PDF's text
 * layer never splits "user-centered" into "user-" + "centered" (which ATS
 * extractors join as "usercentered"). Everything else wraps normally.
 */
export function NoBreakText({ text }: { text: string }) {
  const parts = text.split(HYPHENATED_WORD);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="print-nowrap">
        {part}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
