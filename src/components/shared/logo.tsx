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
  // The global `img { max-width: 100% }` collapses these inside shrink-to-fit
  // containers, so opt out: size comes from the height class, width follows.
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
      blueSrc="/brand/seera-mark.svg"
      whiteSrc="/brand/seera-mark-white.svg"
      className={cn("size-8 w-auto", className)}
    />
  );
}

/**
 * The full lockup (mark + «سِيرة» + SEERAH). The artwork carries both scripts,
 * so it is locale-independent. Falls back to the mark alone when
 * `showWordmark` is false.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  if (!showWordmark) {
    return <LogoMark className={className} />;
  }

  return (
    <ThemedBrandImage
      blueSrc="/brand/seera-logo.svg"
      whiteSrc="/brand/seera-logo-white.svg"
      className={cn("h-8 w-auto", className)}
    />
  );
}
