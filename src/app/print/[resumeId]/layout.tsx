import type { ReactNode } from "react";
import "../print.css";

export const metadata = {
  robots: { index: false, follow: false },
};

/**
 * Standalone root layout for the /print branch: no header, no navigation,
 * no shared app chrome — just the print stylesheet. `dir`/`lang` are set
 * precisely by the page itself from `?lang=`, since layouts don't receive
 * searchParams.
 */
export default function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  );
}
