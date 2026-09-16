import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

const BRAND_NAME = "سِيرة";

/**
 * Renders the brand asset twice and lets CSS pick one, so the blue mark shows
 * in light mode and the white one in dark mode without any client-side state.
 */
function ThemedBrandImage({
  blueSrc,
  whiteSrc,
  className,
}: {
  blueSrc: string;
  whiteSrc: string;
  className?: string;
}) {
  // The brand SVGs carry only a viewBox (no intrinsic width), so the global
  // `img { max-width: 100% }` collapses them to 0px inside shrink-to-fit
  // containers. Size comes from the height class alone; the ratio sets width.
  const sizing = "max-w-none";

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, no optimisation needed */}
      <img src={blueSrc} alt={BRAND_NAME} className={cn(sizing, className, "dark:hidden")} />
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, no optimisation needed */}
      <img
        src={whiteSrc}
        alt=""
        aria-hidden="true"
        className={cn(sizing, className, "hidden dark:block")}
      />
    </>
  );
}

/** The square brand mark on its own, for tight spots like the builder header. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <ThemedBrandImage
      blueSrc="/brand/seera-icon-blue.svg"
      whiteSrc="/brand/seera-icon-white.svg"
      className={cn("size-8 w-auto", className)}
    />
  );
}

/**
 * The full lockup (mark + wordmark), in the wordmark matching the active
 * locale. Falls back to the mark alone when `showWordmark` is false.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  const locale = useLocale();

  if (!showWordmark) {
    return <LogoMark className={className} />;
  }

  const script = locale === "en" ? "en" : "ar";

  return (
    <ThemedBrandImage
      blueSrc={`/brand/seera-logo-${script}-blue.svg`}
      whiteSrc={`/brand/seera-logo-${script}-white.svg`}
      className={cn("h-7 w-auto", className)}
    />
  );
}
